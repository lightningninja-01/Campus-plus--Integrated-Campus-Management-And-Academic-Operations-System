const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  submittedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, default: "" },
  note: { type: String, default: "" },
  marks: { type: Number, default: null },
  feedback: { type: String, default: "" },
  status: {
    type: String,
    enum: ["submitted", "graded", "late"],
    default: "submitted",
  },
});

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 20 },
    submissions: [submissionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);