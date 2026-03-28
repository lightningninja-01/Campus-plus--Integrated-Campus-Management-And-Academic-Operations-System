const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // 6 group types:
    // school     → all students in a school (SOET, SOMC etc.) all sems all branches
    // semester   → all students in same sem across all branches in a school (SOET Sem 6)
    // department → all students of a branch across all sems (AI/ML Sem 1-8)
    // class      → all students of a branch in a specific sem (AI/ML Sem 6)
    // section    → students of specific branch+sem+section (AI/ML Sem 6 Section D)
    // subject    → created by faculty for a course
    // custom     → created by faculty/admin for any purpose
    type: {
      type: String,
      enum: ["school", "semester", "department", "class", "section", "subject", "custom"],
      required: true,
    },

    // Fields used depending on type:
    school:     { type: String, default: null }, // school, semester groups
    semester:   { type: Number, default: null }, // semester, class, section groups
    branch:     { type: String, default: null }, // department, class, section groups
    section:    { type: String, default: null }, // section groups only

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    pinnedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);