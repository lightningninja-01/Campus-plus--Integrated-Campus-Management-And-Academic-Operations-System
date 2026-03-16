const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ── GET assignments for student (their enrolled courses) ──────────────────────
router.get("/my", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    // Get student's enrolled courses
    const courses = await Course.find({ enrolledStudents: req.user.id });
    const courseIds = courses.map((c) => c._id);

    const assignments = await Assignment.find({ course: { $in: courseIds } })
      .populate("course", "name code")
      .populate("faculty", "name")
      .sort({ dueDate: 1 });

    // Add submission status for this student
    const result = assignments.map((a) => {
      const sub = a.submissions.find((s) => String(s.student) === String(req.user.id));
      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        course: a.course,
        faculty: a.faculty,
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
        submission: sub || null,
        status: sub
          ? sub.status
          : new Date(a.dueDate) < new Date()
          ? "overdue"
          : "pending",
      };
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET all assignments for a course (faculty/admin) ─────────────────────────
router.get("/course/:courseId", authMiddleware, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate("course", "name code")
      .populate("faculty", "name")
      .sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── CREATE assignment (faculty only) ─────────────────────────────────────────
router.post("/", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const { title, description, courseId, dueDate, totalMarks } = req.body;

    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ message: "title, courseId, dueDate are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const assignment = await Assignment.create({
      title,
      description,
      course: courseId,
      faculty: req.user.id,
      dueDate,
      totalMarks: totalMarks || 20,
    });

    await assignment.populate("course", "name code");
    res.status(201).json({ message: "Assignment created", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── SUBMIT assignment (student) ───────────────────────────────────────────────
router.post("/:id/submit", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const alreadySubmitted = assignment.submissions.find(
      (s) => String(s.student) === String(req.user.id)
    );
    if (alreadySubmitted) return res.status(400).json({ message: "Already submitted" });

    const isLate = new Date(assignment.dueDate) < new Date();

    assignment.submissions.push({
      student: req.user.id,
      note: req.body.note || "",
      fileUrl: req.body.fileUrl || "",
      status: isLate ? "late" : "submitted",
    });

    await assignment.save();
    res.json({ message: isLate ? "Submitted (late)" : "Submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GRADE a submission (faculty) ─────────────────────────────────────────────
router.put("/:id/grade/:studentId", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const sub = assignment.submissions.find(
      (s) => String(s.student) === String(req.params.studentId)
    );
    if (!sub) return res.status(404).json({ message: "Submission not found" });

    sub.marks = req.body.marks;
    sub.feedback = req.body.feedback || "";
    sub.status = "graded";

    await assignment.save();
    res.json({ message: "Graded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE assignment (faculty who created it) ────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    if (req.user.role === "faculty" && String(assignment.faculty) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ============================
// GET assignments created by this faculty
// Add this to assignment.routes.js before module.exports = router
// ============================

router.get("/my-faculty", authMiddleware, roleMiddleware("faculty"), async (req, res) => {
  try {
    const Assignment = require("../models/Assignment");

    const assignments = await Assignment.find({ faculty: req.user.id })
      .populate("course", "name code")
      .populate("submissions.student", "name email rollNumber")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;