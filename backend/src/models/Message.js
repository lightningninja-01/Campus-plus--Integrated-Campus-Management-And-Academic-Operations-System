const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema({
  emoji:  { type: String, required: true },
  users:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const messageSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyGroup",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text:    { type: String, default: "" },
    fileUrl: { type: String, default: "" },
    fileName:{ type: String, default: "" },
    fileType:{ type: String, default: "" }, // image, pdf, link, etc.

    // Reply to another message
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    // Reactions: [{ emoji: "👍", users: [...] }]
    reactions: [reactionSchema],

    isPinned:  { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);