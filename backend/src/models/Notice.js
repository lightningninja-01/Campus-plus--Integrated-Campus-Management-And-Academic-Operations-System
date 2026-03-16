const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ["exam", "fee", "placement", "scholarship", "event", "general"],
      default: "general",
    },
    targetRole: {
      type: String,
      enum: ["all", "student", "faculty"],
      default: "all",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);