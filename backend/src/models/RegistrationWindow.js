const mongoose = require("mongoose");

const registrationWindowSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, "Semester is required"],
    },
    branch: {
      type: String,
      default: "all", // "all" means open to all branches, otherwise specific branch like "CSE"
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    minCredits: {
      type: Number,
      default: 12,
    },
    maxCredits: {
      type: Number,
      default: 24,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optimize query for active window lookups
registrationWindowSchema.index({ isActive: 1, semester: 1, branch: 1 }, { background: true });

module.exports = mongoose.model("RegistrationWindow", registrationWindowSchema);
