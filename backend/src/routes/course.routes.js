const express = require("express");
const router = express.Router();

// Use lazy require inside handlers to avoid circular dependency issues
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");


// ── GET all courses ───────────────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const Course = require("../models/Course");
    const User   = require("../models/User");

    const user = req.user;
    let query = { isActive: true };

    if (user.role === "student") {
      const fullUser = await User.findById(user.id);
      if (fullUser && fullUser.semester) query.semester = fullUser.semester;
      if (fullUser && fullUser.branch)   query.branch   = fullUser.branch;
    } else if (user.role === "faculty") {
      query.faculty = user.id;
    }

    const courses = await Course.find(query)
      .populate("faculty", "name email designation")
      .sort({ createdAt: -1 });

    const result = courses.map((c) => ({
      ...c.toObject(),
      isEnrolled: user.role === "student"
        ? c.enrolledStudents.map(String).includes(String(user.id))
        : undefined,
      enrolledCount: c.enrolledStudents.length,
    }));

    res.json(result);
  } catch (err) {
    console.error("GET /courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── GET single course ─────────────────────────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const Course = require("../models/Course");

    const course = await Course.findById(req.params.id)
      .populate("faculty", "name email designation")
      .populate("enrolledStudents", "name email rollNumber");

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    console.error("GET /courses/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── CREATE course (admin only) ────────────────────────────────────────────────
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const Course = require("../models/Course");

    const { name, code, description, credits, semester, branch, department, faculty } = req.body;

    if (!name || !code || !semester || !branch || !department) {
      return res.status(400).json({ message: "name, code, semester, branch, department are required" });
    }

    const exists = await Course.findOne({ code });
    if (exists) return res.status(400).json({ message: "Course code already exists" });

    const course = await Course.create({
      name,
      code,
      description: description || "",
      credits:     credits || 3,
      semester:    Number(semester),
      branch,
      department,
      faculty:     faculty || null,  // convert empty string to null
    });

    await course.populate("faculty", "name email");
    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error("POST /courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── UPDATE course (admin only) ────────────────────────────────────────────────
router.put("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const Course = require("../models/Course");

    const updateData = {
      ...req.body,
      faculty: req.body.faculty || null,  // convert empty string to null
    };

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("faculty", "name email");

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated", course });
  } catch (err) {
    console.error("PUT /courses/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── DELETE course (admin only) ────────────────────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const Course = require("../models/Course");

    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error("DELETE /courses/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── ENROLL in course (student only) ──────────────────────────────────────────
router.post("/:id/enroll", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const Course = require("../models/Course");

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.enrolledStudents.map(String).includes(String(req.user.id))) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.enrolledStudents.push(req.user.id);
    await course.save();
    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    console.error("POST /courses/:id/enroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── UNENROLL from course (student only) ──────────────────────────────────────
router.post("/:id/unenroll", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const Course = require("../models/Course");

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.enrolledStudents = course.enrolledStudents.filter(
      (s) => String(s) !== String(req.user.id)
    );
    await course.save();
    res.json({ message: "Unenrolled successfully" });
  } catch (err) {
    console.error("POST /courses/:id/unenroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
