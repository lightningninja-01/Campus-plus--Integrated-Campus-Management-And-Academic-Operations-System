const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    // ============================
    // ROLE - student | faculty | admin
    // ============================
    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },

    // ============================
    // STUDENT SPECIFIC FIELDS
    // ============================
    semester: {
      type: Number,
      default: null, // e.g. 6
    },

    branch: {
      type: String,
      default: null, // e.g. "CSE", "AI/ML", "Data Science"
    },

    section: {
      type: String,
      default: null, // e.g. "A", "B", "C", "D"
    },

    school: {
      type: String,
      default: null, // e.g. "SOET", "SOMC", "SOAD", "SOLS", "SOAS"
    },

    rollNumber: {
      type: String,
      default: null,
    },

    // ============================
    // FACULTY SPECIFIC FIELDS
    // ============================
    department: {
      type: String,
      default: null, // e.g. "CSE"
    },

    designation: {
      type: String,
      default: null, // e.g. "Professor", "Assistant Professor"
    },

    // ============================
    // COMMON FIELDS
    // ============================
    profilePicture: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("User", userSchema);
