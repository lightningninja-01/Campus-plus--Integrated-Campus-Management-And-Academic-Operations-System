const mongoose = require("mongoose");

const timetableEntrySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      trim: true,
    },
    period: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      default: null,
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Main Timetable",
      trim: true,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settings: {
      days: [{ type: String, required: true }],
      periodsPerDay: { type: Number, required: true, min: 1 },
      startHour: { type: Number, required: true, min: 0, max: 23 },
      startMinute: { type: Number, required: true, min: 0, max: 59, default: 0 },
      slotMinutes: { type: Number, required: true, min: 30, default: 60 },
      rooms: [{ type: String, required: true }],
    },
    entries: [timetableEntrySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timetable", timetableSchema);
