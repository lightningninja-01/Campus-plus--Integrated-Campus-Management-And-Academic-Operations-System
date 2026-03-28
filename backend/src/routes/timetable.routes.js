const express = require("express");
const router = express.Router();

const Timetable = require("../models/Timetable");
const Course = require("../models/Course");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_ROOMS = ["Room 101", "Room 102", "Room 103", "Room 104", "Lab 201", "Lab 202"];

const toTimeString = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const normalizeGeneratorSettings = (body = {}) => {
  const days = Array.isArray(body.days) && body.days.length > 0 ? body.days : DEFAULT_DAYS;
  const rooms = Array.isArray(body.rooms) && body.rooms.length > 0
    ? body.rooms.map((room) => String(room).trim()).filter(Boolean)
    : DEFAULT_ROOMS;

  return {
    days,
    periodsPerDay: Math.max(1, Number(body.periodsPerDay) || 6),
    startHour: Number.isFinite(Number(body.startHour)) ? Number(body.startHour) : 9,
    startMinute: Number.isFinite(Number(body.startMinute)) ? Number(body.startMinute) : 0,
    slotMinutes: Math.max(30, Number(body.slotMinutes) || 60),
    rooms,
  };
};

const buildCourseRequests = (courses) => (
  courses
    .map((course) => ({
      course,
      sessionsPerWeek: Math.max(1, Math.min(6, Number(course.credits) || 3)),
      groupKey: `${course.branch}__${course.semester}`,
    }))
    .sort((a, b) => b.sessionsPerWeek - a.sessionsPerWeek)
);

const generateEntries = (courseRequests, settings) => {
  const entries = [];
  const facultyBusy = new Set();
  const roomBusy = new Set();
  const groupBusy = new Set();

  const slotBaseMinutes = settings.startHour * 60 + settings.startMinute;
  const slots = [];

  settings.days.forEach((day) => {
    for (let period = 1; period <= settings.periodsPerDay; period += 1) {
      const start = slotBaseMinutes + ((period - 1) * settings.slotMinutes);
      slots.push({
        day,
        period,
        startTime: toTimeString(start),
        endTime: toTimeString(start + settings.slotMinutes),
      });
    }
  });

  for (const request of courseRequests) {
    let placedCount = 0;
    const placedDays = new Set();

    for (const slot of slots) {
      if (placedCount >= request.sessionsPerWeek) break;

      const facultyKey = `${request.course.faculty}_${slot.day}_${slot.period}`;
      const groupKey = `${request.groupKey}_${slot.day}_${slot.period}`;

      if (facultyBusy.has(facultyKey) || groupBusy.has(groupKey) || placedDays.has(slot.day)) {
        continue;
      }

      const room = settings.rooms.find((item) => !roomBusy.has(`${item}_${slot.day}_${slot.period}`));
      if (!room) {
        continue;
      }

      entries.push({
        ...slot,
        room,
        branch: request.course.branch,
        semester: request.course.semester,
        section: null,
        course: request.course._id,
        faculty: request.course.faculty,
        courseName: request.course.name,
        courseCode: request.course.code,
      });

      facultyBusy.add(facultyKey);
      groupBusy.add(groupKey);
      roomBusy.add(`${room}_${slot.day}_${slot.period}`);
      placedDays.add(slot.day);
      placedCount += 1;
    }

    if (placedCount < request.sessionsPerWeek) {
      throw new Error(`Unable to place all sessions for ${request.course.name}. Try more rooms or periods.`);
    }
  }

  return entries.sort((a, b) => {
    const dayDiff = settings.days.indexOf(a.day) - settings.days.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.period - b.period;
  });
};

router.get("/all", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ isActive: true })
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });

    if (!timetable) {
      return res.json({ timetable: null });
    }

    return res.json({ timetable });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!timetable) return res.json({ entries: [], settings: null });

    const user = await User.findById(req.user.id).select("branch semester section");
    if (!user) return res.status(404).json({ message: "User not found" });

    const entries = timetable.entries.filter((entry) =>
      entry.branch === user.branch &&
      Number(entry.semester) === Number(user.semester) &&
      (!entry.section || entry.section === user.section)
    );

    return res.json({ entries, settings: timetable.settings, generatedAt: timetable.updatedAt });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/faculty", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!timetable) return res.json({ entries: [], settings: null });

    const entries = timetable.entries.filter((entry) => String(entry.faculty) === String(req.user.id));

    return res.json({ entries, settings: timetable.settings, generatedAt: timetable.updatedAt });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/generate", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const settings = normalizeGeneratorSettings(req.body);
    const courses = await Course.find({
      isActive: true,
      faculty: { $ne: null },
    }).populate("faculty", "name email");

    if (!courses.length) {
      return res.status(400).json({ message: "Assign faculty to courses before generating the timetable" });
    }

    const requests = buildCourseRequests(courses);
    const entries = generateEntries(requests, settings);

    await Timetable.updateMany({ isActive: true }, { $set: { isActive: false } });

    const timetable = await Timetable.create({
      name: req.body.name || "Campus+ Master Timetable",
      generatedBy: req.user.id,
      settings,
      entries,
      isActive: true,
    });

    return res.status(201).json({
      message: "Timetable generated successfully",
      timetable,
      stats: {
        courses: courses.length,
        entries: entries.length,
        groups: new Set(entries.map((entry) => `${entry.branch}-${entry.semester}`)).size,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message || "Failed to generate timetable" });
  }
});

router.delete("/active", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!timetable) {
      return res.status(404).json({ message: "No active timetable found" });
    }

    timetable.isActive = false;
    await timetable.save();

    return res.json({ message: "Active timetable archived" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
