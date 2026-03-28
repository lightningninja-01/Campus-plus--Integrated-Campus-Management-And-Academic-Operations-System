const express = require("express");
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
    const courses = await Course.find({ enrolledStudents: req.user.id });

    const summary = await Promise.all(
      courses.map(async (course) => {
        const records = await Attendance.find({ course: course._id });
        const total = records.length;
        const present = records.filter((r) =>
          r.records.some(
            (rec) => String(rec.student) === String(req.user.id) && rec.status === "present"
          )
        ).length;
        const percent = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          course: { _id: course._id, name: course.name, code: course.code },
          total,
          present,
          absent: total - present,
          percent,
          status: percent >= 75 ? "good" : percent >= 60 ? "warning" : "danger",
        };
      })
    );

    res.json(summary);
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
