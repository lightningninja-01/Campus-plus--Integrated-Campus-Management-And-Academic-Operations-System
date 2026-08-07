const express = require("express");
const router = express.Router();

const Timetable = require("../models/Timetable");
const Course = require("../models/Course");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
const { getRedisClient } = require("../config/redis");
const { clearCachePattern } = require("../middleware/cache.middleware");
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

const SLOT_MAP = {
  "A1": [{ day: "Monday", period: 1 }, { day: "Wednesday", period: 1 }],
  "B1": [{ day: "Monday", period: 2 }, { day: "Wednesday", period: 2 }],
  "C1": [{ day: "Monday", period: 3 }, { day: "Wednesday", period: 3 }],
  "D1": [{ day: "Tuesday", period: 1 }, { day: "Thursday", period: 1 }],
  "E1": [{ day: "Tuesday", period: 2 }, { day: "Thursday", period: 2 }],
  "F1": [{ day: "Tuesday", period: 3 }, { day: "Thursday", period: 3 }],
  "A2": [{ day: "Monday", period: 4 }, { day: "Wednesday", period: 4 }],
  "B2": [{ day: "Tuesday", period: 4 }, { day: "Thursday", period: 4 }],
  "G1": [{ day: "Friday", period: 1 }, { day: "Friday", period: 2 }],
  "H1": [{ day: "Friday", period: 3 }, { day: "Friday", period: 4 }],
  "I1": [{ day: "Tuesday", period: 5 }, { day: "Thursday", period: 5 }],
  "J1": [{ day: "Monday", period: 5 }, { day: "Wednesday", period: 5 }],
  "K1": [{ day: "Friday", period: 5 }],
  "C2": [{ day: "Monday", period: 4 }, { day: "Wednesday", period: 4 }],
  "D2": [{ day: "Tuesday", period: 4 }, { day: "Thursday", period: 4 }],
  "E2": [{ day: "Monday", period: 5 }, { day: "Wednesday", period: 5 }],
  "F2": [{ day: "Tuesday", period: 5 }, { day: "Thursday", period: 5 }],
  "G2": [{ day: "Friday", period: 3 }, { day: "Friday", period: 4 }],
  "H2": [{ day: "Friday", period: 5 }, { day: "Friday", period: 6 }],
  "I2": [{ day: "Tuesday", period: 6 }, { day: "Thursday", period: 6 }],
  "J2": [{ day: "Monday", period: 6 }, { day: "Wednesday", period: 6 }],
  "K2": [{ day: "Friday", period: 7 }]
};

const buildCourseRequests = (courses) => (
  courses.map((course) => ({
    course,
    groupKey: `${course.branch}__${course.semester}`,
  }))
);

const generateEntries = (courseRequests, settings) => {
  const assignments = {};
  const facultyBusyPeriods = new Set();
  const groupBusySlots = {}; // format: `${groupKey}_${day}_${period}` -> Array of courses
  const roomBusyPeriods = new Set();

  const preAssigned = courseRequests.filter(r => r.course.slot && SLOT_MAP[r.course.slot]);
  const unassigned = courseRequests.filter(r => !r.course.slot || !SLOT_MAP[r.course.slot]);

  // Sort unassigned courses by credits descending (scheduling heavier courses first reduces backtrack rate)
  unassigned.sort((a, b) => (b.course.credits || 3) - (a.course.credits || 3));

  const checkAndPlaceSlot = (course, slotKey, testOnly = false) => {
    const sessions = SLOT_MAP[slotKey];
    const facultyId = String(course.faculty._id || course.faculty);
    const groupKey = `${course.branch}_${course.semester}`;

    // 1. Verify Faculty & Group conflict bounds
    for (const session of sessions) {
      // Skip session if it exceeds settings boundaries
      if (session.period > settings.periodsPerDay) return null;
      if (!settings.days.includes(session.day)) return null;

      const fKey = `${facultyId}_${session.day}_${session.period}`;
      if (facultyBusyPeriods.has(fKey)) {
        return null;
      }

      // Group conflict bounds (allow parallel electives/VACs, block core conflicts)
      const gKey = `${groupKey}_${session.day}_${session.period}`;
      const scheduled = groupBusySlots[gKey] || [];

      if ((course.category || "core") === "core" && scheduled.length > 0) {
        return null;
      }
      if (scheduled.some(c => (c.category || "core") === "core")) {
        return null;
      }
      if (scheduled.some(c => (c.category || "core") !== (course.category || "core"))) {
        return null;
      }
    }

    // 2. Find room available across all sessions of the slot
    let selectedRoom = null;
    for (const room of settings.rooms) {
      let roomAvailable = true;
      for (const session of sessions) {
        if (roomBusyPeriods.has(`${room}_${session.day}_${session.period}`)) {
          roomAvailable = false;
          break;
        }
      }
      if (roomAvailable) {
        selectedRoom = room;
        break;
      }
    }

    if (!selectedRoom) return null;

    if (!testOnly) {
      for (const session of sessions) {
        facultyBusyPeriods.add(`${facultyId}_${session.day}_${session.period}`);
        
        const gKey = `${groupKey}_${session.day}_${session.period}`;
        if (!groupBusySlots[gKey]) groupBusySlots[gKey] = [];
        groupBusySlots[gKey].push(course);

        roomBusyPeriods.add(`${selectedRoom}_${session.day}_${session.period}`);
      }
    }

    return selectedRoom;
  };

  const removeSlotAllocation = (course, slotKey, room) => {
    const sessions = SLOT_MAP[slotKey];
    const facultyId = String(course.faculty._id || course.faculty);
    const groupKey = `${course.branch}_${course.semester}`;
    for (const session of sessions) {
      facultyBusyPeriods.delete(`${facultyId}_${session.day}_${session.period}`);
      
      const gKey = `${groupKey}_${session.day}_${session.period}`;
      if (groupBusySlots[gKey]) {
        groupBusySlots[gKey] = groupBusySlots[gKey].filter(c => String(c._id || c) !== String(course._id || course));
        if (groupBusySlots[gKey].length === 0) {
          delete groupBusySlots[gKey];
        }
      }

      roomBusyPeriods.delete(`${room}_${session.day}_${session.period}`);
    }
  };

  // Place pre-assigned slots
  for (const req of preAssigned) {
    const room = checkAndPlaceSlot(req.course, req.course.slot, false);
    if (!room) {
      throw new Error(`Conflict placing pre-assigned slot "${req.course.slot}" for course ${req.course.name} (${req.course.code}). Check room bounds or change its slot.`);
    }
    assignments[req.course._id] = { slotKey: req.course.slot, room };
  }

  // Backtracking CSP Solver
  const solve = (index) => {
    if (index >= unassigned.length) return true;

    const req = unassigned[index];
    const slotKeys = Object.keys(SLOT_MAP);

    for (const slotKey of slotKeys) {
      const room = checkAndPlaceSlot(req.course, slotKey, false);
      if (room) {
        assignments[req.course._id] = { slotKey, room };

        if (solve(index + 1)) return true;

        // Backtrack
        removeSlotAllocation(req.course, slotKey, room);
        delete assignments[req.course._id];
      }
    }

    return false;
  };

  const solved = solve(0);
  if (!solved) {
    throw new Error("Unable to place all courses in a conflict-free timeline. Try adding more classrooms or expanding periods per day.");
  }

  // Compile final entry formats
  const entries = [];
  const slotBaseMinutes = settings.startHour * 60 + settings.startMinute;
  const periodTimes = {};

  for (let p = 1; p <= settings.periodsPerDay; p++) {
    const start = slotBaseMinutes + ((p - 1) * settings.slotMinutes);
    periodTimes[p] = {
      startTime: toTimeString(start),
      endTime: toTimeString(start + settings.slotMinutes)
    };
  }

  const allRequests = [...preAssigned, ...unassigned];
  const courseSlotAssignments = [];

  for (const req of allRequests) {
    const assign = assignments[req.course._id];
    if (!assign) continue;

    courseSlotAssignments.push({
      courseId: req.course._id,
      slotKey: assign.slotKey,
      room: assign.room
    });

    const sessions = SLOT_MAP[assign.slotKey];
    for (const session of sessions) {
      if (session.period > settings.periodsPerDay) continue;

      const times = periodTimes[session.period] || { startTime: "09:00", endTime: "10:00" };
      entries.push({
        day: session.day,
        period: session.period,
        startTime: times.startTime,
        endTime: times.endTime,
        room: assign.room,
        branch: req.course.branch,
        semester: req.course.semester,
        section: null,
        course: req.course._id,
        faculty: req.course.faculty._id || req.course.faculty,
        courseName: req.course.name,
        courseCode: req.course.code
      });
    }
  }

  return { entries, courseSlotAssignments };
};

router.get("/all", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const cacheKey = "timetable:admin:all";

    const cachedTimetable = await redisClient.get(cacheKey);
    if (cachedTimetable) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cachedTimetable));
    }

    const timetable = await Timetable.findOne({ isActive: true })
      .populate("generatedBy", "name email")
      .sort({ createdAt: -1 });

    if (!timetable) {
      return res.json({ timetable: null });
    }

    const responseBody = { timetable };
    await redisClient.set(cacheKey, JSON.stringify(responseBody), { EX: 3600 });

    res.setHeader("X-Cache", "MISS");
    return res.json(responseBody);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/my", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const redisClient = getRedisClient();

    const userClassKey = `user:class-info:${req.user.id}`;
    let classInfoStr = await redisClient.get(userClassKey);
    let user;

    if (classInfoStr) {
      user = JSON.parse(classInfoStr);
    } else {
      user = await User.findById(req.user.id).select("branch semester section");
      if (user) {
        await redisClient.set(userClassKey, JSON.stringify(user), { EX: 1800 });
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const sem = user.semester || 0;
    const branch = user.branch || "none";
    const sec = user.section || "none";
    const cacheKey = `timetable:student:${branch}:${sem}:${sec}`;

    const cachedTimetable = await redisClient.get(cacheKey);
    if (cachedTimetable) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cachedTimetable));
    }

    const timetable = await Timetable.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!timetable) return res.json({ entries: [], settings: null });

    const entries = timetable.entries.filter((entry) =>
      entry.branch === user.branch &&
      Number(entry.semester) === Number(user.semester) &&
      (!entry.section || entry.section === user.section)
    );

    const responseBody = { entries, settings: timetable.settings, generatedAt: timetable.updatedAt };
    await redisClient.set(cacheKey, JSON.stringify(responseBody), { EX: 3600 });

    res.setHeader("X-Cache", "MISS");
    return res.json(responseBody);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/faculty", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const redisClient = getRedisClient();
    const cacheKey = `timetable:faculty:${req.user.id}`;

    const cachedTimetable = await redisClient.get(cacheKey);
    if (cachedTimetable) {
      res.setHeader("X-Cache", "HIT");
      return res.json(JSON.parse(cachedTimetable));
    }

    const timetable = await Timetable.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!timetable) return res.json({ entries: [], settings: null });

    const entries = timetable.entries.filter((entry) => String(entry.faculty) === String(req.user.id));
    const responseBody = { entries, settings: timetable.settings, generatedAt: timetable.updatedAt };

    await redisClient.set(cacheKey, JSON.stringify(responseBody), { EX: 3600 });

    res.setHeader("X-Cache", "MISS");
    return res.json(responseBody);
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
    const { entries, courseSlotAssignments } = generateEntries(requests, settings);

    // Save assigned slots back to Course model so registration slots stay in sync!
    for (const assign of courseSlotAssignments) {
      await Course.findByIdAndUpdate(assign.courseId, { 
        slot: assign.slotKey 
      });
    }

    await Timetable.updateMany({ isActive: true }, { $set: { isActive: false } });

    const timetable = await Timetable.create({
      name: req.body.name || "Campus+ Master Timetable",
      generatedBy: req.user.id,
      settings,
      entries,
      isActive: true,
    });

    // Invalidate all timetable caches
    await clearCachePattern("timetable:*");

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

    // Invalidate all timetable caches
    await clearCachePattern("timetable:*");

    return res.json({ message: "Active timetable archived" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
