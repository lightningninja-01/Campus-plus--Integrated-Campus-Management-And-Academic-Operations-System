const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
  register,
  login,
  getMe,
  updateProfile,
  getUsers,
  createStaffUser,
  toggleUserActive,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.get("/users", authMiddleware, roleMiddleware("admin"), getUsers);
router.post("/users", authMiddleware, roleMiddleware("admin"), createStaffUser);
router.put("/users/:id/toggle-active", authMiddleware, roleMiddleware("admin"), toggleUserActive);

router.post("/seed-demo", async (req, res) => {
  try {
    const { seedDatabase } = require("../scripts/seed");
    const result = await seedDatabase();
    res.json(result);
  } catch (err) {
    console.error("Auth seeding error:", err);
    res.status(500).json({ message: "Seeding failed", error: err.message });
  }
});

module.exports = router;
