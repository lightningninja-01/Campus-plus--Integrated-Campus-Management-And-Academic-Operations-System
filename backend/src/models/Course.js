const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    code:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    credits:     { type: Number, default: 3 },
    semester:    { type: Number, required: true },
    branch:      { type: String, required: true },
    department:  { type: String, required: true },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);