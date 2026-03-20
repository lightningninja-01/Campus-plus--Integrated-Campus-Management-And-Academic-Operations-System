const express = require("express");
const router  = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// ─── helpers ──────────────────────────────────────────────────────────────────
// Build the set of groups a student is "relevant" for based on their profile
function buildStudentConditions(student) {
  const conditions = [];

  // 1. School group — their school, no sem restriction
  if (student.school) {
    conditions.push({ type: "school", school: student.school });
  }

  // 2. Semester group — all branches, their sem, their school (cross-branch)
  if (student.school && student.semester) {
    conditions.push({ type: "semester", school: student.school, semester: student.semester });
  }

  // 3. Department group — their branch, all sems
  if (student.branch) {
    conditions.push({ type: "department", branch: student.branch });
  }

  // 4. Class group — their branch + their sem (all sections)
  if (student.branch && student.semester) {
    conditions.push({ type: "class", branch: student.branch, semester: student.semester });
  }

  // 5. Section group — their branch + sem + section
  if (student.branch && student.semester && student.section) {
    conditions.push({
      type: "section",
      branch: student.branch,
      semester: student.semester,
      section: student.section,
    });
  }

  // 6. Subject groups — faculty created, their branch + sem
  if (student.branch && student.semester) {
    conditions.push({ type: "subject", branch: student.branch, semester: student.semester });
  }

  // 7. Custom groups — all students can see these
  conditions.push({ type: "custom" });

  return conditions;
}

// ── GET /studygroups ──────────────────────────────────────────────────────────
// ?tab=mine|browse   (default: mine for students, all for faculty/admin)
// ?type=school|semester|department|class|section|subject|custom
router.get("/", authMiddleware, async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const User       = require("../models/User");

    const { tab = "mine", type } = req.query;

    // Faculty / admin — see everything
    if (req.user.role !== "student") {
      const q = { isActive: true };
      if (type) q.type = type;
      const groups = await StudyGroup.find(q)
        .populate("createdBy", "name role")
        .populate("members", "name role branch semester section")
        .sort({ type: 1, createdAt: -1 });
      return res.json(groups);
    }

    // Student — smart filtering
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const relevantConditions = buildStudentConditions(student);

    if (tab === "mine") {
      // Show only relevant groups
      const q = { isActive: true, $or: relevantConditions };
      if (type) q.type = type;
      const groups = await StudyGroup.find(q)
        .populate("createdBy", "name role")
        .populate("members", "name role branch semester section")
        .sort({ type: 1, createdAt: -1 });
      return res.json(groups);
    }

    if (tab === "browse") {
      // Show groups NOT in their relevant set (other branches, custom groups etc.)
      // But ENFORCE semester safety — never show other semester's class/section groups
      const q = {
        isActive: true,
        $nor: relevantConditions,
        // Never expose wrong-semester class or section groups
        $and: [
          {
            $or: [
              // Allow school/dept/custom groups from other schools/branches
              { type: { $in: ["school", "department", "custom", "subject"] } },
              // Allow cross-branch semester groups of OTHER sems (they can see but not auto-join)
              { type: "semester" },
              // NEVER show class/section groups of other sems
            ],
          },
          // Exclude class and section groups entirely from browse
          { type: { $nin: ["class", "section"] } },
        ],
      };
      if (type) q.type = type;
      const groups = await StudyGroup.find(q)
        .populate("createdBy", "name role")
        .populate("members", "name role")
        .sort({ type: 1, createdAt: -1 });
      return res.json(groups);
    }

    res.json([]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET single group ──────────────────────────────────────────────────────────
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const group = await StudyGroup.findById(req.params.id)
      .populate("createdBy", "name role")
      .populate("members", "name email role branch semester section")
      .populate("pinnedMessages");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── CREATE group — faculty/admin only ─────────────────────────────────────────
router.post("/", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const { name, description, type, school, semester, branch, section } = req.body;

    if (!name || !type) return res.status(400).json({ message: "name and type required" });

    const group = await StudyGroup.create({
      name,
      description: description || "",
      type,
      school:    school    || null,
      semester:  semester  ? Number(semester) : null,
      branch:    branch    || null,
      section:   section   || null,
      createdBy: req.user.id,
      members:   [req.user.id],
    });

    await group.populate("createdBy", "name role");
    res.status(201).json({ message: "Group created", group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── JOIN group ────────────────────────────────────────────────────────────────
router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const User       = require("../models/User");

    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.map(String).includes(String(req.user.id))) {
      return res.status(400).json({ message: "Already a member" });
    }

    // Students cannot join class/section groups of other semesters
    if (req.user.role === "student") {
      const student = await User.findById(req.user.id);
      if (student) {
        if (
          (group.type === "class" || group.type === "section") &&
          group.semester && group.semester !== student.semester
        ) {
          return res.status(403).json({
            message: `You cannot join a Semester ${group.semester} group. You are in Semester ${student.semester}.`,
          });
        }
      }
    }

    group.members.push(req.user.id);
    await group.save();
    res.json({ message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── LEAVE group ───────────────────────────────────────────────────────────────
router.post("/:id/leave", authMiddleware, async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.members = group.members.filter(m => String(m) !== String(req.user.id));
    await group.save();
    res.json({ message: "Left group" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── DELETE group — faculty/admin only, custom groups only ─────────────────────
router.delete("/:id", authMiddleware, roleMiddleware("faculty", "admin"), async (req, res) => {
  try {
    const StudyGroup = require("../models/StudyGroup");
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const predefined = ["school", "semester", "department", "class", "section"];
    if (predefined.includes(group.type)) {
      return res.status(403).json({ message: "Predefined groups cannot be deleted." });
    }

    if (String(group.createdBy) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can delete this group." });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;