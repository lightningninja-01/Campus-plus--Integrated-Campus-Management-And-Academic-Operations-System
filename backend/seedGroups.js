// ============================================================
// seedGroups.js — Run ONCE to create all predefined groups
// Usage: node seedGroups.js   (from backend/ folder)
// ============================================================
require("dotenv").config();
const mongoose   = require("mongoose");
const connectDB  = require("./src/config/database");
const StudyGroup = require("./src/models/StudyGroup");
const User       = require("./src/models/User");

// ── University config ─────────────────────────────────────────────────────────
const SCHOOLS   = ["SOET", "SOMC", "SOAD", "SOLS", "SOAS"];
const BRANCHES  = ["CSE", "AI/ML", "Data Science", "Cyber Security", "Full Stack Development", "UI/UX Design", "Cloud Computing", "Robotics"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Sections per branch
const SECTIONS_BY_BRANCH = {
  "CSE":                    ["A","B","C","D","E","F","G"],
  "AI/ML":                  ["A","B","C","D"],
  "Data Science":           ["A","B","C","D"],
  "Cyber Security":         ["A","B","C","D"],
  "Full Stack Development": ["A","B","C","D"],
  "UI/UX Design":           ["A","B","C"],
  "Cloud Computing":        ["A","B","C"],
  "Robotics":               ["A","B","C"],
};

// SOET has all the BTech branches
const SOET_BRANCHES = BRANCHES;

async function seed() {
  await connectDB();
  console.log("✅ Connected to DB\n");

  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    console.error("❌ No admin user found. Register an admin first, then run this script.");
    process.exit(1);
  }
  console.log(`Using admin: ${admin.name} (${admin.email})\n`);

  let created = 0;
  let skipped = 0;

  const createGroup = async (data) => {
    const exists = await StudyGroup.findOne({ type: data.type, school: data.school || null, semester: data.semester || null, branch: data.branch || null, section: data.section || null });
    if (exists) { skipped++; return; }
    await StudyGroup.create({ ...data, createdBy: admin._id, members: [admin._id] });
    console.log(`✅ [${data.type.toUpperCase()}] ${data.name}`);
    created++;
  };

  // ── 1. SCHOOL groups (1 per school) ────────────────────────────────────────
  console.log("── School groups ────────────────────────────────");
  for (const school of SCHOOLS) {
    await createGroup({
      name:        `${school} - All Students`,
      description: `Campus-wide group for all students of ${school}`,
      type:        "school",
      school,
    });
  }

  // ── 2. SEMESTER groups (8 sems × per school) ────────────────────────────────
  // Cross-branch — all students in same sem same school
  console.log("\n── Semester groups (cross-branch per school) ────");
  for (const school of SCHOOLS) {
    for (const semester of SEMESTERS) {
      await createGroup({
        name:        `${school} - Semester ${semester}`,
        description: `All ${school} students in Semester ${semester} across all branches`,
        type:        "semester",
        school,
        semester,
      });
    }
  }

  // ── 3. DEPARTMENT groups (1 per branch, all sems) ───────────────────────────
  console.log("\n── Department groups (all sems per branch) ──────");
  for (const branch of BRANCHES) {
    await createGroup({
      name:        `${branch} - Department`,
      description: `All ${branch} students from Semester 1 to 8`,
      type:        "department",
      branch,
    });
  }

  // ── 4. CLASS groups (branch × semester) ────────────────────────────────────
  // All sections of a branch in same sem
  console.log("\n── Class groups (branch × semester) ─────────────");
  for (const branch of BRANCHES) {
    for (const semester of SEMESTERS) {
      await createGroup({
        name:        `${branch} - Sem ${semester}`,
        description: `All ${branch} students in Semester ${semester} (all sections)`,
        type:        "class",
        branch,
        semester,
      });
    }
  }

  // ── 5. SECTION groups (branch × semester × section) ────────────────────────
  console.log("\n── Section groups (branch × semester × section) ─");
  for (const branch of BRANCHES) {
    const sections = SECTIONS_BY_BRANCH[branch] || ["A", "B", "C"];
    for (const semester of SEMESTERS) {
      for (const section of sections) {
        await createGroup({
          name:        `${branch} Sem ${semester} - Section ${section}`,
          description: `${branch} Semester ${semester} Section ${section} students`,
          type:        "section",
          branch,
          semester,
          section,
        });
      }
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`   Created : ${created}`);
  console.log(`   Skipped : ${skipped} (already exist)`);
  console.log(`\nGroup breakdown:`);
  console.log(`   School groups    : ${SCHOOLS.length}`);
  console.log(`   Semester groups  : ${SCHOOLS.length * 8}`);
  console.log(`   Department groups: ${BRANCHES.length}`);
  console.log(`   Class groups     : ${BRANCHES.length * 8}`);

  const totalSections = Object.values(SECTIONS_BY_BRANCH).reduce((s, arr) => s + arr.length, 0);
  console.log(`   Section groups   : ${totalSections * 8}`);
  console.log(`\n   Subject + Custom groups are created by faculty/admin manually.`);

  mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});