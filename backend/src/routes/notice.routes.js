const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const { cacheMiddleware, clearCachePattern } = require("../middleware/cache.middleware");

// ── GET all notices (filtered by role) ───────────────────────────────────────
router.get(
  "/",
  authMiddleware,
  cacheMiddleware({
    ttl: 300, // 5 minutes cache
    keyPrefix: "notices",
    keyBuilder: (req) => req.user.role, // Cache specifically per user role
  }),
  async (req, res) => {
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
  }
);

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

    // Invalidate notice cache
    await clearCachePattern("notices:*");

    res.status(201).json({ message: "Notice created", notice });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE notice (admin only) ────────────────────────────────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    
    // Invalidate notice cache
    await clearCachePattern("notices:*");

    res.json({ message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;