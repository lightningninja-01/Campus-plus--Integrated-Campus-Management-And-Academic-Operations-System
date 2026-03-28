const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

async function loadAuthorizedGroup(groupId, userId) {
  const StudyGroup = require("../models/StudyGroup");
  const group = await StudyGroup.findById(groupId);

  if (!group) {
    return { error: { status: 404, message: "Group not found" } };
  }

  const isMember = group.members.map(String).includes(String(userId));
  if (!isMember) {
    return { error: { status: 403, message: "Join the group first" } };
  }

  return { group };
}

// ── GET messages for a group (paginated) ─────────────────────────────────────
router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const Message    = require("../models/Message");
    const { error } = await loadAuthorizedGroup(req.params.groupId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip  = (page - 1) * limit;

    const messages = await Message.find({ group: req.params.groupId, isDeleted: false })
      .populate("sender", "name role branch semester")
      .populate("replyTo", "text sender")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── SEND message ──────────────────────────────────────────────────────────────
router.post("/:groupId", authMiddleware, async (req, res) => {
  try {
    const Message    = require("../models/Message");
    const { error } = await loadAuthorizedGroup(req.params.groupId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { text, fileUrl, fileName, fileType, replyTo } = req.body;

    if (!text && !fileUrl) {
      return res.status(400).json({ message: "Message text or file required" });
    }

    const message = await Message.create({
      group:    req.params.groupId,
      sender:   req.user.id,
      text:     text     || "",
      fileUrl:  fileUrl  || "",
      fileName: fileName || "",
      fileType: fileType || "",
      replyTo:  replyTo  || null,
    });

    await message.populate("sender", "name role branch semester");
    if (replyTo) await message.populate("replyTo", "text sender");

    // Emit via socket if available
    const io = req.app.get("io");
    if (io) io.to(req.params.groupId).emit("new_message", message);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── REACT to message ──────────────────────────────────────────────────────────
router.post("/:groupId/react/:messageId", authMiddleware, async (req, res) => {
  try {
    const Message = require("../models/Message");
    const { error } = await loadAuthorizedGroup(req.params.groupId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: "Emoji required" });

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (String(message.group) !== String(req.params.groupId)) {
      return res.status(400).json({ message: "Message does not belong to this group" });
    }

    const existing = message.reactions.find(r => r.emoji === emoji);
    if (existing) {
      const idx = existing.users.map(String).indexOf(String(req.user.id));
      if (idx > -1) {
        existing.users.splice(idx, 1); // toggle off
        if (existing.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existing.users.push(req.user.id); // add reaction
      }
    } else {
      message.reactions.push({ emoji, users: [req.user.id] });
    }

    await message.save();
    await message.populate("sender", "name role");

    const io = req.app.get("io");
    if (io) io.to(req.params.groupId).emit("message_updated", message);

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── PIN / UNPIN message ───────────────────────────────────────────────────────
router.post("/:groupId/pin/:messageId", authMiddleware, async (req, res) => {
  try {
    const Message    = require("../models/Message");
    const { group, error } = await loadAuthorizedGroup(req.params.groupId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (String(message.group) !== String(req.params.groupId)) {
      return res.status(400).json({ message: "Message does not belong to this group" });
    }

    message.isPinned = !message.isPinned;
    await message.save();

    // Update group's pinnedMessages array
    if (message.isPinned) {
      if (!group.pinnedMessages.map(String).includes(String(message._id))) {
        group.pinnedMessages.push(message._id);
      }
    } else {
      group.pinnedMessages = group.pinnedMessages.filter(
        m => String(m) !== String(message._id)
      );
    }
    await group.save();

    const io = req.app.get("io");
    if (io) io.to(req.params.groupId).emit("message_updated", message);

    res.json({ message: message.isPinned ? "Message pinned" : "Message unpinned", isPinned: message.isPinned });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE message (sender only) ──────────────────────────────────────────────
router.delete("/:groupId/:messageId", authMiddleware, async (req, res) => {
  try {
    const Message = require("../models/Message");
    const { error } = await loadAuthorizedGroup(req.params.groupId, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (String(message.group) !== String(req.params.groupId)) {
      return res.status(400).json({ message: "Message does not belong to this group" });
    }

    if (String(message.sender) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    message.isDeleted = true;
    message.text = "This message was deleted";
    await message.save();

    const io = req.app.get("io");
    if (io) io.to(req.params.groupId).emit("message_updated", message);

    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
