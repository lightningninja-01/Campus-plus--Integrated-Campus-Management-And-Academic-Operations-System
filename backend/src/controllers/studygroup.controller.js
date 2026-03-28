const StudyGroup = require("../models/StudyGroup");
const User = require("../models/User");

function buildStudentConditions(student) {
  const conditions = [];

  if (student.school) {
    conditions.push({ type: "school", school: student.school });
  }

  if (student.school && student.semester) {
    conditions.push({ type: "semester", school: student.school, semester: student.semester });
  }

  if (student.branch) {
    conditions.push({ type: "department", branch: student.branch });
  }

  if (student.branch && student.semester) {
    conditions.push({ type: "class", branch: student.branch, semester: student.semester });
  }

  if (student.branch && student.semester && student.section) {
    conditions.push({
      type: "section",
      branch: student.branch,
      semester: student.semester,
      section: student.section,
    });
  }

  if (student.branch && student.semester) {
    conditions.push({ type: "subject", branch: student.branch, semester: student.semester });
  }

  conditions.push({ type: "custom" });

  return conditions;
}

function isGroupMember(group, userId) {
  return group.members.map(String).includes(String(userId));
}

exports.getStudyGroups = async (req, res) => {
  try {
    const { tab = "mine", type } = req.query;

    if (req.user.role !== "student") {
      const query = { isActive: true };
      if (type) query.type = type;

      const groups = await StudyGroup.find(query)
        .populate("createdBy", "name role")
        .populate("members", "name role branch semester section")
        .sort({ type: 1, createdAt: -1 });

      return res.json(groups);
    }

    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const relevantConditions = buildStudentConditions(student);

    if (tab === "mine") {
      const query = { isActive: true, $or: relevantConditions };
      if (type) query.type = type;

      const groups = await StudyGroup.find(query)
        .populate("createdBy", "name role")
        .populate("members", "name role branch semester section")
        .sort({ type: 1, createdAt: -1 });

      return res.json(groups);
    }

    if (tab === "browse") {
      const query = {
        isActive: true,
        $nor: relevantConditions,
        $and: [
          {
            $or: [
              { type: { $in: ["school", "department", "custom", "subject"] } },
              { type: "semester" },
            ],
          },
          { type: { $nin: ["class", "section"] } },
        ],
      };

      if (type) query.type = type;

      const groups = await StudyGroup.find(query)
        .populate("createdBy", "name role")
        .populate("members", "name role")
        .sort({ type: 1, createdAt: -1 });

      return res.json(groups);
    }

    return res.json([]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getStudyGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate("createdBy", "name role")
      .populate("members", "name email role branch semester section")
      .populate("pinnedMessages");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (req.user.role === "admin") {
      return res.json(group);
    }

    if (req.user.role !== "student") {
      if (isGroupMember(group, req.user.id) || String(group.createdBy._id) === String(req.user.id)) {
        return res.json(group);
      }

      return res.status(403).json({ message: "Not authorized to view this group" });
    }

    if (isGroupMember(group, req.user.id)) {
      return res.json(group);
    }

    return res.status(403).json({ message: "Join this group to view its details" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createStudyGroup = async (req, res) => {
  try {
    const { name, description, type, school, semester, branch, section } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "name and type required" });
    }

    const group = await StudyGroup.create({
      name,
      description: description || "",
      type,
      school: school || null,
      semester: semester ? Number(semester) : null,
      branch: branch || null,
      section: section || null,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await group.populate("createdBy", "name role");
    return res.status(201).json({ message: "Group created", group });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.joinStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.map(String).includes(String(req.user.id))) {
      return res.status(400).json({ message: "Already a member" });
    }

    if (req.user.role === "student") {
      const student = await User.findById(req.user.id);
      if (student) {
        if (
          (group.type === "class" || group.type === "section") &&
          group.semester &&
          group.semester !== student.semester
        ) {
          return res.status(403).json({
            message: `You cannot join a Semester ${group.semester} group. You are in Semester ${student.semester}.`,
          });
        }

        const isRelevant = buildStudentConditions(student).some((condition) =>
          Object.entries(condition).every(([key, value]) => String(group[key]) === String(value))
        );

        if (!isRelevant) {
          return res.status(403).json({
            message: "You are not allowed to join this group",
          });
        }
      }
    }

    group.members.push(req.user.id);
    await group.save();

    return res.json({ message: "Joined successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.leaveStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    group.members = group.members.filter((member) => String(member) !== String(req.user.id));
    await group.save();

    return res.json({ message: "Left group" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const predefined = ["school", "semester", "department", "class", "section"];
    if (predefined.includes(group.type)) {
      return res.status(403).json({ message: "Predefined groups cannot be deleted." });
    }

    if (String(group.createdBy) !== String(req.user.id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the creator or admin can delete this group." });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);
    return res.json({ message: "Group deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
