const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ── GET all notices (filtered by role) ───────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const query = {
      isActive: true,
      targetRole: { $in: ["all", req.user.role] },
    };
    const notices = await Notice.find(query)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── CREATE notice (admin only) ────────────────────────────────────────────────
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { title, body, category, targetRole } = req.body;
    if (!title || !body) return res.status(400).json({ message: "title and body required" });

    const notice = await Notice.create({
      title,
      body,
      category: category || "general",
      targetRole: targetRole || "all",
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Notice created", notice });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE notice (admin only) ────────────────────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;