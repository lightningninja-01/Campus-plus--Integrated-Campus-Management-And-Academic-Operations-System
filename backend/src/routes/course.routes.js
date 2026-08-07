const express = require("express");
const router = express.Router();

// Use lazy require inside handlers to avoid circular dependency issues
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");


// ── REGISTRATION WINDOW CRUD & STATUS ENDPOINTS ──────────────────────────────

// GET registration status for current student
router.get("/registration/status", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const Course = require("../models/Course");
    const User = require("../models/User");
    const RegistrationWindow = require("../models/RegistrationWindow");

    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const now = new Date();
    const activeWindow = await RegistrationWindow.findOne({
      semester: student.semester,
      $or: [{ branch: "all" }, { branch: student.branch }],
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    const enrolledCourses = await Course.find({ enrolledStudents: req.user.id });
    const currentCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 3), 0);

    res.json({
      isOpen: !!activeWindow,
      window: activeWindow || null,
      currentCredits,
      minCredits: activeWindow ? activeWindow.minCredits : 12,
      maxCredits: activeWindow ? activeWindow.maxCredits : 24,
      studentSemester: student.semester,
      studentBranch: student.branch,
      enrolledCourses: enrolledCourses.map(c => ({
        _id: c._id,
        name: c.name,
        code: c.code,
        credits: c.credits,
        slot: c.slot,
        category: c.category
      }))
    });
  } catch (err) {
    console.error("GET /courses/registration/status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all registration windows (Admin view)
router.get("/registration/windows", authMiddleware, async (req, res) => {
  try {
    const RegistrationWindow = require("../models/RegistrationWindow");
    
    if (req.user.role === "admin") {
      const windows = await RegistrationWindow.find().sort({ semester: 1, startDate: -1 });
      return res.json(windows);
    } else {
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "Profile not found" });

      const now = new Date();
      const activeWindow = await RegistrationWindow.findOne({
        semester: user.semester || 0,
        $or: [{ branch: "all" }, { branch: user.branch || "none" }],
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      return res.json(activeWindow ? [activeWindow] : []);
    }
  } catch (err) {
    console.error("GET /courses/registration/windows error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE registration window (Admin only)
router.post("/registration/windows", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const RegistrationWindow = require("../models/RegistrationWindow");
    const { semester, branch, startDate, endDate, minCredits, maxCredits, isActive } = req.body;

    if (!semester || !startDate || !endDate) {
      return res.status(400).json({ message: "semester, startDate, and endDate are required" });
    }

    const window = await RegistrationWindow.create({
      semester: Number(semester),
      branch: branch || "all",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      minCredits: Number(minCredits) || 12,
      maxCredits: Number(maxCredits) || 24,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ message: "Registration window created successfully", window });
  } catch (err) {
    console.error("POST /courses/registration/windows error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE registration window (Admin only)
router.put("/registration/windows/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const RegistrationWindow = require("../models/RegistrationWindow");
    const { semester, branch, startDate, endDate, minCredits, maxCredits, isActive } = req.body;

    const window = await RegistrationWindow.findById(req.params.id);
    if (!window) return res.status(404).json({ message: "Registration window not found" });

    if (semester !== undefined) window.semester = Number(semester);
    if (branch !== undefined) window.branch = branch;
    if (startDate !== undefined) window.startDate = new Date(startDate);
    if (endDate !== undefined) window.endDate = new Date(endDate);
    if (minCredits !== undefined) window.minCredits = Number(minCredits);
    if (maxCredits !== undefined) window.maxCredits = Number(maxCredits);
    if (isActive !== undefined) window.isActive = isActive;

    await window.save();
    res.json({ message: "Registration window updated successfully", window });
  } catch (err) {
    console.error("PUT /courses/registration/windows/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE registration window (Admin only)
router.delete("/registration/windows/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const RegistrationWindow = require("../models/RegistrationWindow");
    const window = await RegistrationWindow.findByIdAndDelete(req.params.id);
    if (!window) return res.status(404).json({ message: "Registration window not found" });

    res.json({ message: "Registration window deleted successfully" });
  } catch (err) {
    console.error("DELETE /courses/registration/windows/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


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

    const { name, code, description, credits, semester, branch, department, faculty, capacity, category, slot } = req.body;

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
      capacity:    capacity !== undefined ? Number(capacity) : 60,
      category:    category || "core",
      slot:        slot || null,
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
    const User = require("../models/User");
    const RegistrationWindow = require("../models/RegistrationWindow");

    const studentId = req.user.id;

    // 1. Fetch Student Profile
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });
    if (!student.semester) return res.status(400).json({ message: "Student semester not configured. Please contact administration." });

    // 2. Fetch Target Course
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.semester !== student.semester) {
      return res.status(400).json({ message: `This course is for semester ${course.semester}, but you are in semester ${student.semester}` });
    }

    if (course.branch !== "all" && student.branch && course.branch !== student.branch) {
      return res.status(400).json({ message: `This course is for ${course.branch} branch, but you are in ${student.branch}` });
    }

    // 3. Verify Active Registration Window
    const now = new Date();
    const activeWindow = await RegistrationWindow.findOne({
      semester: student.semester,
      $or: [{ branch: "all" }, { branch: student.branch }],
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!activeWindow) {
      return res.status(403).json({ message: "Course registration is currently closed for your branch/semester." });
    }

    // 4. Check if already enrolled
    if (course.enrolledStudents.map(String).includes(String(studentId))) {
      return res.status(400).json({ message: "You are already enrolled in this course." });
    }

    // 5. Verify Seat Capacity
    const capacity = course.capacity || 60;
    if (course.enrolledStudents.length >= capacity) {
      return res.status(400).json({ message: `Course is full! Seat limit of ${capacity} reached.` });
    }

    // Fetch all student's current courses to evaluate slots & credits
    const enrolledCourses = await Course.find({ enrolledStudents: studentId });

    // 6. Verify Time-Slot Clash
    if (course.slot) {
      const clashingCourse = enrolledCourses.find(c => c.slot && c.slot === course.slot);
      if (clashingCourse) {
        return res.status(400).json({ 
          message: `Slot clash detected! This course uses slot "${course.slot}" which conflicts with your enrolled course: ${clashingCourse.name} (${clashingCourse.code}).` 
        });
      }
    }

    // 7. Verify Credit Boundary
    const currentCredits = enrolledCourses.reduce((sum, c) => sum + (c.credits || 3), 0);
    const incomingCredits = course.credits || 3;
    const maxCreditsAllowed = activeWindow.maxCredits || 24;

    if (currentCredits + incomingCredits > maxCreditsAllowed) {
      return res.status(400).json({ 
        message: `Credit limit exceeded! Enrolling would bring you to ${currentCredits + incomingCredits} credits, but the maximum allowed is ${maxCreditsAllowed} credits.` 
      });
    }

    // All validation passed! Enroll student
    course.enrolledStudents.push(studentId);
    await course.save();

    res.json({ 
      message: "Enrolled successfully", 
      creditsRegistered: currentCredits + incomingCredits 
    });
  } catch (err) {
    console.error("POST /courses/:id/enroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ── UNENROLL from course (student only) ──────────────────────────────────────
router.post("/:id/unenroll", authMiddleware, roleMiddleware("student"), async (req, res) => {
  try {
    const Course = require("../models/Course");
    const User = require("../models/User");
    const RegistrationWindow = require("../models/RegistrationWindow");

    const studentId = req.user.id;

    // Fetch Student Profile
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    // Verify Active Registration Window
    const now = new Date();
    const activeWindow = await RegistrationWindow.findOne({
      semester: student.semester,
      $or: [{ branch: "all" }, { branch: student.branch }],
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    if (!activeWindow) {
      return res.status(403).json({ message: "Course registration is closed. Changes are not permitted." });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Remove student enrollment
    const originalLength = course.enrolledStudents.length;
    course.enrolledStudents = course.enrolledStudents.filter(
      (s) => String(s) !== String(studentId)
    );

    if (course.enrolledStudents.length === originalLength) {
      return res.status(400).json({ message: "You are not enrolled in this course." });
    }

    await course.save();
    res.json({ message: "Unenrolled successfully" });
  } catch (err) {
    console.error("POST /courses/:id/unenroll error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
