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
  // ── Core slots (3 sessions = 3 periods per week) ──
  "A1": [{ day: "Monday", period: 1 }, { day: "Wednesday", period: 1 }, { day: "Friday", period: 1 }],
  "B1": [{ day: "Monday", period: 2 }, { day: "Wednesday", period: 2 }, { day: "Friday", period: 2 }],
  "C1": [{ day: "Monday", period: 3 }, { day: "Wednesday", period: 3 }, { day: "Friday", period: 3 }],
  "D1": [{ day: "Tuesday", period: 1 }, { day: "Thursday", period: 1 }, { day: "Friday", period: 4 }],
  "E1": [{ day: "Tuesday", period: 2 }, { day: "Thursday", period: 2 }, { day: "Friday", period: 5 }],
  "F1": [{ day: "Tuesday", period: 3 }, { day: "Thursday", period: 3 }, { day: "Friday", period: 6 }],

  // ── Elective/VAC slots (2 sessions = 2 periods per week) ──
  "A2": [{ day: "Monday", period: 4 }, { day: "Wednesday", period: 4 }],
  "B2": [{ day: "Tuesday", period: 4 }, { day: "Thursday", period: 4 }],
  "C2": [{ day: "Monday", period: 5 }, { day: "Wednesday", period: 5 }],
  "D2": [{ day: "Tuesday", period: 5 }, { day: "Thursday", period: 5 }],
  "E2": [{ day: "Monday", period: 6 }, { day: "Wednesday", period: 6 }],
  "F2": [{ day: "Tuesday", period: 6 }, { day: "Thursday", period: 6 }],

  // ── Synonyms / Alt bindings mapped to fit in 6 periods ──
  "G1": [{ day: "Monday", period: 4 }, { day: "Wednesday", period: 4 }],
  "H1": [{ day: "Tuesday", period: 4 }, { day: "Thursday", period: 4 }],
  "I1": [{ day: "Monday", period: 5 }, { day: "Wednesday", period: 5 }],
  "J1": [{ day: "Tuesday", period: 5 }, { day: "Thursday", period: 5 }],
  "K1": [{ day: "Monday", period: 6 }, { day: "Wednesday", period: 6 }],
  "G2": [{ day: "Monday", period: 4 }, { day: "Wednesday", period: 4 }],
  "H2": [{ day: "Tuesday", period: 4 }, { day: "Thursday", period: 4 }],
  "I2": [{ day: "Monday", period: 5 }, { day: "Wednesday", period: 5 }],
  "J2": [{ day: "Tuesday", period: 5 }, { day: "Thursday", period: 5 }],
  "K2": [{ day: "Monday", period: 6 }, { day: "Wednesday", period: 6 }]
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
  const initialUnassigned = courseRequests.filter(r => !r.course.slot || !SLOT_MAP[r.course.slot]);
  const unassigned = [...initialUnassigned];
  const warnings = [];

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
      warnings.push(`Pre-assigned slot "${req.course.slot}" for course "${req.course.name}" (${req.course.code}) conflicted. Rescheduled dynamically.`);
      unassigned.push(req);
    } else {
      assignments[req.course._id] = { slotKey: req.course.slot, room };
    }
  }

  // Sort unassigned courses by credits descending (scheduling heavier courses first reduces backtrack rate)
  unassigned.sort((a, b) => (b.course.credits || 3) - (a.course.credits || 3));

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
    warnings.push("Notice: Strict schedule generation was impossible. The system has relaxed constraints to generate a layout, minimizing clashes where possible.");
    
    // Clear all strict allocations so we start fresh for the relaxed heuristic pass
    for (const key of Object.keys(assignments)) {
      delete assignments[key];
    }
    facultyBusyPeriods.clear();
    for (const key of Object.keys(groupBusySlots)) {
      delete groupBusySlots[key];
    }
    roomBusyPeriods.clear();

    const slotKeys = Object.keys(SLOT_MAP);

    for (const req of unassigned) {
      let bestSlot = null;
      let bestRoom = null;
      let bestScore = Infinity;
      let bestWarnings = [];

      for (const slotKey of slotKeys) {
        const sessions = SLOT_MAP[slotKey];
        const facultyId = String(req.course.faculty._id || req.course.faculty);
        const groupKey = `${req.course.branch}_${req.course.semester}`;
        
        let score = 0;
        let slotWarnings = [];

        // 1. Check Faculty busy
        for (const session of sessions) {
          const fKey = `${facultyId}_${session.day}_${session.period}`;
          if (facultyBusyPeriods.has(fKey)) {
            score += 10;
            slotWarnings.push(`Faculty conflict: ${req.course.faculty.name} is scheduled to teach multiple courses concurrently during slot ${slotKey}.`);
            break;
          }
        }

        // 2. Check Group busy
        for (const session of sessions) {
          const gKey = `${groupKey}_${session.day}_${session.period}`;
          const scheduled = groupBusySlots[gKey] || [];
          if ((req.course.category || "core") === "core" && scheduled.length > 0) {
            score += 10;
            slotWarnings.push(`Group conflict: ${req.course.branch} Sem ${req.course.semester} students have overlapping core classes in slot ${slotKey}.`);
            break;
          }
          if (scheduled.some(c => (c.category || "core") === "core")) {
            score += 10;
            slotWarnings.push(`Group conflict: ${req.course.branch} Sem ${req.course.semester} students have overlapping core classes in slot ${slotKey}.`);
            break;
          }
          if (scheduled.some(c => (c.category || "core") !== (req.course.category || "core"))) {
            score += 10;
            slotWarnings.push(`Group conflict: ${req.course.branch} Sem ${req.course.semester} students have overlapping categories in slot ${slotKey}.`);
            break;
          }
        }

        // 3. Find Room
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

        if (!selectedRoom) {
          score += 1;
          selectedRoom = `Virtual Room ${settings.rooms.length + 1}`;
          slotWarnings.push(`Classroom shortage: Allocated virtual classroom '${selectedRoom}' for ${req.course.name} (${req.course.code}) during slot ${slotKey}.`);
        }

        if (score < bestScore) {
          bestScore = score;
          bestSlot = slotKey;
          bestRoom = selectedRoom;
          bestWarnings = slotWarnings;
        }
      }

      // Assign the best slot found
      assignments[req.course._id] = { slotKey: bestSlot, room: bestRoom };
      warnings.push(...bestWarnings);

      // Mark busy
      const sessions = SLOT_MAP[bestSlot];
      const facultyId = String(req.course.faculty._id || req.course.faculty);
      const groupKey = `${req.course.branch}_${req.course.semester}`;
      for (const session of sessions) {
        facultyBusyPeriods.add(`${facultyId}_${session.day}_${session.period}`);
        
        const gKey = `${groupKey}_${session.day}_${session.period}`;
        if (!groupBusySlots[gKey]) groupBusySlots[gKey] = [];
        groupBusySlots[gKey].push(req.course);

        roomBusyPeriods.add(`${bestRoom}_${session.day}_${session.period}`);
      }
    }
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

  return { entries, courseSlotAssignments, warnings };
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
    const { entries, courseSlotAssignments, warnings } = generateEntries(requests, settings);

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
      warnings,
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
