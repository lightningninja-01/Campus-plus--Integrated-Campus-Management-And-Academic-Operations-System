const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const canManageCourseAttendance = (course, user) => {
  if (!course) return false;
  if (user.role === "admin") return true;
  return String(course.faculty) === String(user.id);
};

// ── GET student's attendance summary (all courses) ───────────────────────────
router.get("/my", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id }).select("name code");
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json([]);
    }

    // High-performance aggregation: computes total sessions and present counts database-side
    const aggregationResults = await Attendance.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $project: {
          course: 1,
          studentRecord: {
            $filter: {
              input: "$records",
              as: "rec",
              cond: { $eq: ["$$rec.student", new mongoose.Types.ObjectId(req.user.id)] },
            },
          },
        },
      },
      { $unwind: { path: "$studentRecord", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$course",
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$studentRecord.status", "present"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const statsMap = {};
    aggregationResults.forEach((stat) => {
      statsMap[stat._id.toString()] = {
        total: stat.total,
        present: stat.present,
      };
    });

    const summary = courses.map((course) => {
      const stats = statsMap[course._id.toString()] || { total: 0, present: 0 };
      const total = stats.total;
      const present = stats.present;
      const percent = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        course: { _id: course._id, name: course.name, code: course.code },
        total,
        present,
        absent: total - present,
        percent,
        status: percent >= 75 ? "good" : percent >= 60 ? "warning" : "danger",
      };
    });

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET faculty's general attendance and student alert summary ───────────────────
router.get("/faculty/summary", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user.id }).select("name code enrolledStudents");
    const courseIds = courses.map((c) => c._id);

    if (courseIds.length === 0) {
      return res.json({ courseStats: [], lowAttendanceStudents: [] });
    }

    // Get attendance aggregates per student and course
    const attendanceAgg = await Attendance.aggregate([
      { $match: { course: { $in: courseIds } } },
      { $unwind: "$records" },
      {
        $group: {
          _id: { course: "$course", student: "$records.student" },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $eq: ["$records.status", "present"] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Populate student profiles
    const Student = require("../models/User");
    const populatedAgg = await Promise.all(
      attendanceAgg.map(async (item) => {
        const studentObj = await Student.findById(item._id.student).select("name rollNumber email branch semester");
        const courseObj = courses.find((c) => String(c._id) === String(item._id.course));
        const percent = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
        return {
          student: studentObj,
          course: { _id: item._id.course, name: courseObj?.name, code: courseObj?.code },
          total: item.total,
          present: item.present,
          percent,
        };
      })
    );

    // Compute stats per course
    const courseStats = courses.map((course) => {
      const matches = populatedAgg.filter((item) => String(item.course._id) === String(course._id));
      const totalSessions = matches.reduce((s, m) => s + m.total, 0);
      const totalPresents = matches.reduce((s, m) => s + m.present, 0);
      const avgPercent = totalSessions > 0 ? Math.round((totalPresents / totalSessions) * 100) : 100;

      return {
        _id: course._id,
        name: course.name,
        code: course.code,
        avgPercent,
        enrolledCount: course.enrolledStudents?.length || 0,
      };
    });

    // Filter low attendance (percent < 75)
    const lowAttendanceStudents = populatedAgg.filter((item) => item.percent < 75 && item.student);

    res.json({ courseStats, lowAttendanceStudents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET attendance for a course on a date (faculty) ───────────────────────────
router.get("/course/:courseId", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select("faculty");
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!canManageCourseAttendance(course, req.user)) {
      return res.status(403).json({ message: "Not authorized for this course" });
    }

    const records = await Attendance.find({ course: req.params.courseId })
      .populate("records.student", "name rollNumber")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── MARK attendance (faculty) ────────────────────────────────────────────────
router.post("/mark", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    // records = [{ studentId, status: "present"|"absent"|"late" }]

    if (!courseId || !date || !records) {
      return res.status(400).json({ message: "courseId, date, records required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!canManageCourseAttendance(course, req.user)) {
      return res.status(403).json({ message: "Not authorized for this course" });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Upsert — one record per course per day
    const existing = await Attendance.findOne({ course: courseId, date: attendanceDate });

    if (existing) {
      existing.records = records.map((r) => ({ student: r.studentId, status: r.status }));
      await existing.save();
      return res.json({ message: "Attendance updated" });
    }

    await Attendance.create({
      course: courseId,
      faculty: req.user.id,
      date: attendanceDate,
      records: records.map((r) => ({ student: r.studentId, status: r.status })),
    });

    res.status(201).json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
