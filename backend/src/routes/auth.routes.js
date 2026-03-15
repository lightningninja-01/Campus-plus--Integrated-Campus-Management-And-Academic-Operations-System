const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");


// ============================
// REGISTER
// ============================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, semester, branch, rollNumber, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const allowedRoles = ["student", "faculty", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    };

    if (role === "student" || !role) {
      if (semester) userData.semester = semester;
      if (branch) userData.branch = branch;
      if (rollNumber) userData.rollNumber = rollNumber;
    }

    if (role === "faculty") {
      if (department) userData.department = department;
      if (designation) userData.designation = designation;
    }

    const user = await User.create(userData);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// LOGIN
// ============================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated. Contact admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Include role in token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        branch: user.branch,
        rollNumber: user.rollNumber,
        department: user.department,
        designation: user.designation,
        profilePicture: user.profilePicture,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// GET CURRENT USER (/auth/me)
// ============================

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// UPDATE PROFILE (/auth/profile)
// ============================

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email, semester, branch, rollNumber, department, designation } = req.body;

    const updates = {};
    if (name)        updates.name = name;
    if (email)       updates.email = email;
    if (semester)    updates.semester = semester;
    if (branch)      updates.branch = branch;
    if (rollNumber)  updates.rollNumber = rollNumber;
    if (department)  updates.department = department;
    if (designation) updates.designation = designation;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// GET ALL USERS BY ROLE (admin only)
// GET /auth/users?role=student
// GET /auth/users?role=faculty
// GET /auth/users (all users)
// ============================

router.get("/users", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    const query = { _id: { $ne: req.user.id } }; // exclude self
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ============================
// TOGGLE USER ACTIVE STATUS (admin only)
// PUT /auth/users/:id/toggle-active
// ============================

router.put("/users/:id/toggle-active", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;