const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      semester,
      branch,
      section,
      school,
      rollNumber,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role && role !== "student") {
      return res.status(403).json({
        message: "Public registration is limited to student accounts",
      });
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
      role: "student",
    };

    if (semester) userData.semester = semester;
    if (branch) userData.branch = branch;
    if (section) userData.section = section;
    if (school) userData.school = school;
    if (rollNumber) userData.rollNumber = rollNumber;

    const user = await User.create(userData);

    return res.status(201).json({
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
    return res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
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

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        semester: user.semester,
        branch: user.branch,
        section: user.section,
        school: user.school,
        rollNumber: user.rollNumber,
        department: user.department,
        designation: user.designation,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      semester,
      branch,
      section,
      school,
      rollNumber,
      department,
      designation,
      employeeCode,
      profilePicture,
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (semester) updates.semester = semester;
    if (branch) updates.branch = branch;
    if (section) updates.section = section;
    if (school) updates.school = school;
    if (rollNumber !== undefined) updates.rollNumber = rollNumber;
    if (department) updates.department = department;
    if (designation) updates.designation = designation;
    if (employeeCode !== undefined) updates.employeeCode = employeeCode;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { _id: { $ne: req.user.id } };
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, employeeCode } = req.body;

    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim().toLowerCase();
    const safeRole = String(role || "").trim();
    const safeDepartment = String(department || "").trim();
    const safeDesignation = String(designation || "").trim();
    const safeEmployeeCode = String(employeeCode || "").trim();

    if (!safeName || !safeEmail || !password || !safeRole) {
      return res.status(400).json({ message: "name, email, password and role are required" });
    }

    if (!["faculty", "admin"].includes(safeRole)) {
      return res.status(400).json({ message: "Only faculty or admin accounts can be created here" });
    }

    if (safeRole === "faculty" && !safeDepartment) {
      return res.status(400).json({ message: "department is required for faculty accounts" });
    }

    const existingUser = await User.findOne({ email: safeEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name: safeName,
      email: safeEmail,
      password: hashedPassword,
      role: safeRole,
      department: safeRole === "faculty" ? safeDepartment : null,
      designation: safeRole === "faculty" ? safeDesignation || null : null,
      employeeCode: safeEmployeeCode || null
    };

    const user = await User.create(userData);

    return res.status(201).json({
      message: `${safeRole === "admin" ? "Admin" : "Faculty"} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeCode: user.employeeCode,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    if (error?.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    // Generate a simple numeric 6-digit reset token
    const token = String(Math.floor(100000 + Math.random() * 900000));
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    return res.json({
      message: "Reset token generated successfully",
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token.trim(),
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
