const express = require("express");
const router = express.Router();
const Result = require("../models/Result");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ── GET student's own results ─────────────────────────────────────────────────
router.get("/my", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate("course", "name code credits")
      .sort({ semester: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET results for a course (faculty/admin) ──────────────────────────────────
router.get("/course/:courseId", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const results = await Result.find({ course: req.params.courseId })
      .populate("student", "name rollNumber email")
      .populate("course", "name code");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── UPLOAD / UPDATE result (faculty or admin) ────────────────────────────────
router.post("/", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const { studentId, courseId, semester, internalMarks, externalMarks, maxMarks, remarks } = req.body;

    if (!studentId || !courseId || !semester) {
      return res.status(400).json({ message: "studentId, courseId, semester required" });
    }

    const total = (internalMarks || 0) + (externalMarks || 0);

    const result = await Result.findOneAndUpdate(
      { student: studentId, course: courseId, semester },
      {
        student: studentId,
        course: courseId,
        semester,
        internalMarks: internalMarks || 0,
        externalMarks: externalMarks || 0,
        totalMarks: total,
        maxMarks: maxMarks || 100,
        remarks: remarks || "",
        uploadedBy: req.user.id,
      },
      { upsert: true, new: true, runValidators: true }
    );

    await result.populate("course", "name code");
    res.status(201).json({ message: "Result uploaded", result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE result (admin only) ────────────────────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: "Result deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;