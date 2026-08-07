const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    semester: { type: Number, required: true },
    internalMarks: { type: Number, default: 0 },
    externalMarks: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    maxMarks: { type: Number, default: 100 },
    grade: { type: String, default: "" },
    remarks: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// One result per student per course per semester
resultSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });

// Auto-calculate grade before save
resultSchema.pre("save", function (next) {
  const p = (this.totalMarks / this.maxMarks) * 100;
  if (p >= 90) this.grade = "A+";
  else if (p >= 80) this.grade = "A";
  else if (p >= 70) this.grade = "B+";
  else if (p >= 60) this.grade = "B";
  else if (p >= 50) this.grade = "C";
  else if (p >= 40) this.grade = "D";
  else this.grade = "F";
  next();
});

module.exports = mongoose.model("Result", resultSchema);
