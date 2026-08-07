const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ["present", "absent", "late"], default: "absent" },
      },
    ],
  },
  { timestamps: true }
);

// One attendance record per course per date
attendanceSchema.index({ course: 1, date: 1 }, { unique: true });
// Index on the student ID within records array to optimize student summary queries
attendanceSchema.index({ "records.student": 1 }, { background: true });

module.exports = mongoose.model("Attendance", attendanceSchema);