const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Course = require("../models/Course");
const RegistrationWindow = require("../models/RegistrationWindow");
const Notice = require("../models/Notice");
const Assignment = require("../models/Assignment");
const Result = require("../models/Result");
const Timetable = require("../models/Timetable");
const Attendance = require("../models/Attendance");

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");

    // 1. Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await RegistrationWindow.deleteMany({});
    await Notice.deleteMany({});
    await Assignment.deleteMany({});
    await Result.deleteMany({});
    await Timetable.deleteMany({});
    await Attendance.deleteMany({});
    console.log("Cleared existing collections.");

    // 2. Create Users
    const facultyPasswordHash = await bcrypt.hash("faculty123", 10);
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const adminPasswordHash = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Nishant",
      email: "admin@campus.edu",
      password: adminPasswordHash,
      role: "admin"
    });

    const alan = await User.create({
      name: "Dr. Alan Turing",
      email: "alan@campus.edu",
      password: facultyPasswordHash,
      role: "faculty",
      department: "CSE",
      designation: "Professor"
    });

    const grace = await User.create({
      name: "Dr. Grace Hopper",
      email: "grace@campus.edu",
      password: facultyPasswordHash,
      role: "faculty",
      department: "CSE",
      designation: "Professor"
    });

    const ada = await User.create({
      name: "Dr. Ada Lovelace",
      email: "ada@campus.edu",
      password: facultyPasswordHash,
      role: "faculty",
      department: "ECE",
      designation: "Associate Professor"
    });

    const ujjwal = await User.create({
      name: "Ujjwal",
      email: "ujjwal@campus.edu",
      password: studentPasswordHash,
      role: "student",
      semester: 7,
      branch: "CSE",
      section: "A",
      department: "CSE",
      rollNumber: "CS001",
      school: "SOET"
    });

    const amit = await User.create({
      name: "Amit",
      email: "amit@campus.edu",
      password: studentPasswordHash,
      role: "student",
      semester: 7,
      branch: "CSE",
      section: "A",
      department: "CSE",
      rollNumber: "CS002",
      school: "SOET"
    });

    const priya = await User.create({
      name: "Priya",
      email: "priya@campus.edu",
      password: studentPasswordHash,
      role: "student",
      semester: 7,
      branch: "ECE",
      section: "B",
      department: "ECE",
      rollNumber: "EC001",
      school: "SOET"
    });

    const rahul = await User.create({
      name: "Rahul",
      email: "rahul@campus.edu",
      password: studentPasswordHash,
      role: "student",
      semester: 3,
      branch: "CSE",
      section: "B",
      department: "CSE",
      rollNumber: "CS089",
      school: "SOET"
    });

    console.log("Created users.");

    // 3. Create Courses
    const coursesData = [
      {
        name: "Machine Learning",
        code: "CS701",
        credits: 4,
        semester: 7,
        branch: "CSE",
        department: "CSE",
        slot: "A1",
        capacity: 60,
        category: "core",
        faculty: alan._id,
        isActive: true,
        description: "Introduction to Supervised, Unsupervised, and Deep Learning algorithms."
      },
      {
        name: "Distributed Systems",
        code: "CS702",
        credits: 4,
        semester: 7,
        branch: "CSE",
        department: "CSE",
        slot: "B1",
        capacity: 60,
        category: "core",
        faculty: grace._id,
        isActive: true,
        description: "Concepts of replication, consistency models, consensus protocol (Raft/Paxos), and RPCs."
      },
      {
        name: "Cloud Computing",
        code: "CS703",
        credits: 3,
        semester: 7,
        branch: "CSE",
        department: "CSE",
        slot: "C1",
        capacity: 1, // Cap to 1 for capacity testing
        category: "elective",
        faculty: alan._id,
        isActive: true,
        description: "Hands-on study of AWS services, virtualization, and Serverless architectures."
      },
      {
        name: "Natural Language Processing",
        code: "CS704",
        credits: 3,
        semester: 7,
        branch: "CSE",
        department: "CSE",
        slot: "C1", // Shares slot C1 with Cloud Computing for clash testing
        category: "elective",
        faculty: grace._id,
        isActive: true,
        description: "Foundational concepts of NLP, Tokenization, LSTMs, and modern Transformers."
      },
      {
        name: "Cryptography & Network Security",
        code: "CS705",
        credits: 3,
        semester: 7,
        branch: "CSE",
        department: "CSE",
        slot: "D1",
        capacity: 60,
        category: "elective",
        faculty: alan._id,
        isActive: true,
        description: "Public and private key encryption standards, hashes, signatures, and TLS."
      },
      {
        name: "Embedded Systems",
        code: "EC701",
        credits: 4,
        semester: 7,
        branch: "ECE",
        department: "ECE",
        slot: "A1",
        capacity: 60,
        category: "core",
        faculty: ada._id,
        isActive: true,
        description: "Microcontrollers, RTOS foundations, and peripheral interfacing interfaces."
      },
      {
        name: "Data Structures",
        code: "CS301",
        credits: 4,
        semester: 3,
        branch: "CSE",
        department: "CSE",
        slot: "A2",
        capacity: 60,
        category: "core",
        faculty: grace._id,
        isActive: true,
        description: "Study of arrays, linked lists, trees, graphs, sorting, and search algorithms."
      }
    ];

    const courses = await Course.create(coursesData);
    const mlCourse = courses[0];
    const dsCourse = courses[1];
    const cloudCourse = courses[2];
    const ecCourse = courses[5];
    const dataStrCourse = courses[6];

    console.log("Created courses.");

    // Enroll students in core courses to populate enrolledStudent lists
    mlCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await mlCourse.save();

    dsCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await dsCourse.save();

    ecCourse.enrolledStudents.push(priya._id);
    await ecCourse.save();

    dataStrCourse.enrolledStudents.push(rahul._id);
    await dataStrCourse.save();

    // 4. Create Registration Windows
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysLater = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    await RegistrationWindow.create([
      {
        semester: 7,
        branch: "all",
        startDate: threeDaysAgo,
        endDate: fourDaysLater,
        minCredits: 12,
        maxCredits: 24,
        isActive: true
      },
      {
        semester: 3,
        branch: "CSE",
        startDate: tenDaysAgo,
        endDate: twoDaysAgo,
        minCredits: 12,
        maxCredits: 24,
        isActive: true
      }
    ]);
    console.log("Created registration windows.");

    // 5. Create Notices
    await Notice.create([
      {
        title: "End Semester Exams Timetable Released",
        body: "The end-semester exam timetable is available on the main college board. Exams will commence from November 15th.",
        category: "exam",
        targetRole: "all",
        createdBy: admin._id
      },
      {
        title: "Machine Learning Lab Submission Extension",
        body: "Students can submit their Machine Learning Lab report by next Monday. No further extension requests will be entertained.",
        category: "general",
        targetRole: "student",
        createdBy: alan._id
      },
      {
        title: "Faculty Meeting with Dean in Main Seminar Hall",
        body: "All department faculty are requested to assemble in the Main Seminar Hall today at 3:00 PM for the annual review meeting.",
        category: "general",
        targetRole: "faculty",
        createdBy: admin._id
      }
    ]);
    console.log("Created notices.");

    // 6. Create Assignments
    await Assignment.create([
      {
        title: "Gradient Descent Implementation",
        description: "Implement Batch and Stochastic Gradient Descent from scratch in Python. Do not use sklearn.",
        course: mlCourse._id,
        faculty: alan._id,
        totalMarks: 100,
        dueDate: fourDaysLater
      },
      {
        title: "Raft Consensus Design",
        description: "Write a design document detailing the leader election and log replication mechanisms in your Raft implementation.",
        course: dsCourse._id,
        faculty: grace._id,
        totalMarks: 100,
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Created assignments.");

    // 7. Create Past Results
    await Result.create([
      {
        student: ujjwal._id,
        course: mlCourse._id,
        semester: 6,
        totalMarks: 88,
        maxMarks: 100,
        uploadedBy: alan._id
      },
      {
        student: ujjwal._id,
        course: dsCourse._id,
        semester: 6,
        totalMarks: 95,
        maxMarks: 100,
        uploadedBy: grace._id
      },
      {
        student: ujjwal._id,
        course: cloudCourse._id,
        semester: 6,
        totalMarks: 74,
        maxMarks: 100,
        uploadedBy: alan._id
      },
      {
        student: amit._id,
        course: mlCourse._id,
        semester: 6,
        totalMarks: 80,
        maxMarks: 100,
        uploadedBy: alan._id
      }
    ]);
    console.log("Created results.");

    // 8. Create Timetable
    await Timetable.create({
      name: "Main ODD Sem Timetable",
      generatedBy: admin._id,
      settings: {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        periodsPerDay: 4,
        startHour: 9,
        startMinute: 0,
        slotMinutes: 60,
        rooms: ["LH-101", "LH-102", "Lab-2"]
      },
      isActive: true,
      entries: [
        {
          day: "Monday",
          period: 1,
          startTime: "09:00",
          endTime: "10:00",
          room: "LH-101",
          branch: "CSE",
          semester: 7,
          section: "A",
          course: mlCourse._id,
          faculty: alan._id,
          courseName: mlCourse.name,
          courseCode: mlCourse.code
        },
        {
          day: "Monday",
          period: 2,
          startTime: "10:00",
          endTime: "11:00",
          room: "LH-101",
          branch: "CSE",
          semester: 7,
          section: "A",
          course: dsCourse._id,
          faculty: grace._id,
          courseName: dsCourse.name,
          courseCode: dsCourse.code
        },
        {
          day: "Wednesday",
          period: 1,
          startTime: "09:00",
          endTime: "10:00",
          room: "LH-101",
          branch: "CSE",
          semester: 7,
          section: "A",
          course: mlCourse._id,
          faculty: alan._id,
          courseName: mlCourse.name,
          courseCode: mlCourse.code
        },
        {
          day: "Wednesday",
          period: 2,
          startTime: "10:00",
          endTime: "11:00",
          room: "LH-101",
          branch: "CSE",
          semester: 7,
          section: "A",
          course: dsCourse._id,
          faculty: grace._id,
          courseName: dsCourse.name,
          courseCode: dsCourse.code
        }
      ]
    });
    console.log("Created timetable.");

    console.log("Database seeded successfully! 🎉");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Database seeding failed:", error);
    throw error;
  }
};

// If run directly from the command line
if (require.main === module) {
  require("dotenv").config();
  const dbUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/campus-plus";
  mongoose.connect(dbUri)
    .then(async () => {
      console.log("Connected to MongoDB for seeding...");
      await seedDatabase();
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error("Connection failed during CLI seeding:", err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
