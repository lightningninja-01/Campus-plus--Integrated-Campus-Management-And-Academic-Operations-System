const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
  getStudyGroups,
  getStudyGroupById,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  deleteStudyGroup,
} = require("../controllers/studygroup.controller");

const router = express.Router();

router.get("/", authMiddleware, getStudyGroups);
router.get("/:id", authMiddleware, getStudyGroupById);
router.post("/", authMiddleware, roleMiddleware("faculty", "admin"), createStudyGroup);
router.post("/:id/join", authMiddleware, joinStudyGroup);
router.post("/:id/leave", authMiddleware, leaveStudyGroup);
router.delete("/:id", authMiddleware, roleMiddleware("faculty", "admin"), deleteStudyGroup);

module.exports = router;
