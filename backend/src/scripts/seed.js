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
    console.log("Starting comprehensive database seeding...");

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

    // Hashed Passwords
    const facultyPasswordHash = await bcrypt.hash("faculty123", 10);
    const studentPasswordHash = await bcrypt.hash("student123", 10);
    const adminPasswordHash = await bcrypt.hash("admin123", 10);

    // 2. Create Admin
    const admin = await User.create({
      name: "Nishant",
      email: "admin@campus.edu",
      password: adminPasswordHash,
      role: "admin"
    });

    // 3. Create 20 Faculty Members
    const facultyList = [
      { name: "Dr. Alan Turing", email: "alan@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Grace Hopper", email: "grace@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Ada Lovelace", email: "ada@campus.edu", department: "ECE", designation: "Associate Professor" },
      { name: "Dr. John von Neumann", email: "neumann@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Claude Shannon", email: "shannon@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Margaret Hamilton", email: "margaret@campus.edu", department: "CSE", designation: "Associate Professor" },
      { name: "Dr. Barbara Liskov", email: "liskov@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Donald Knuth", email: "knuth@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Dennis Ritchie", email: "ritchie@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Ken Thompson", email: "thompson@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Linus Torvalds", email: "linus@campus.edu", department: "CSE", designation: "Associate Professor" },
      { name: "Dr. Tim Berners-Lee", email: "tim@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. Bjarne Stroustrup", email: "bjarne@campus.edu", department: "CSE", designation: "Associate Professor" },
      { name: "Dr. Vint Cerf", email: "vint@campus.edu", department: "CSE", designation: "Professor" },
      { name: "Dr. James Gosling", email: "gosling@campus.edu", department: "CSE", designation: "Associate Professor" },
      { name: "Dr. Guido van Rossum", email: "guido@campus.edu", department: "CSE", designation: "Assistant Professor" },
      { name: "Dr. Stephen Hawking", email: "hawking@campus.edu", department: "Physics", designation: "Professor" },
      { name: "Dr. Richard Feynman", email: "feynman@campus.edu", department: "Physics", designation: "Professor" },
      { name: "Dr. Marie Curie", email: "curie@campus.edu", department: "Chemistry", designation: "Professor" },
      { name: "Dr. Katherine Johnson", email: "johnson@campus.edu", department: "Math", designation: "Professor" }
    ];

    const faculties = [];
    for (const f of facultyList) {
      const created = await User.create({
        name: f.name,
        email: f.email,
        password: facultyPasswordHash,
        role: "faculty",
        department: f.department,
        designation: f.designation
      });
      faculties.push(created);
    }
    console.log(`Created ${faculties.length} faculty members.`);

    // Destructure some faculties for courses
    const [
      fTuring, fHopper, fLovelace, fNeumann, fShannon, 
      fHamilton, fLiskov, fKnuth, fRitchie, fThompson, 
      fTorvalds, fTim, fBjarne, fVint, fGosling, 
      fGuido, fHawking, fFeynman, fCurie, fJohnson
    ] = faculties;

    // 4. Create Students
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

    console.log("Created students.");

    // 5. Create 30 Courses
    const coursesData = [
      // CSE Semester 7
      { name: "Machine Learning", code: "CS701", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "A1", capacity: 60, category: "core", faculty: fTuring._id, description: "Introduction to Supervised, Unsupervised, and Deep Learning algorithms." },
      { name: "Distributed Systems", code: "CS702", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "B1", capacity: 60, category: "core", faculty: fHopper._id, description: "Concepts of replication, consistency models, consensus protocol (Raft/Paxos), and RPCs." },
      { name: "Cloud Computing", code: "CS703", credits: 3, semester: 7, branch: "CSE", department: "CSE", slot: "C1", capacity: 1, category: "elective", faculty: fNeumann._id, description: "AWS cloud architectures, Lambda functions, and serverless computing." },
      { name: "Natural Language Processing", code: "CS704", credits: 3, semester: 7, branch: "CSE", department: "CSE", slot: "C1", capacity: 60, category: "elective", faculty: fHopper._id, description: "Foundations of NLP, LSTM models, Attention mechanisms, and Transformers." },
      { name: "Cryptography & Network Security", code: "CS705", credits: 3, semester: 7, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "elective", faculty: fShannon._id, description: "Symmetric and asymmetric encryption, public key infrastructure, and SSL/TLS." },
      { name: "Internet of Things", code: "CS706", credits: 3, semester: 7, branch: "CSE", department: "CSE", slot: "B2", capacity: 60, category: "elective", faculty: fLovelace._id, description: "Sensors, actuators, node microcontroller programming, and cloud ingestion." },
      
      // ECE Semester 7
      { name: "Embedded Systems", code: "EC701", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "A1", capacity: 60, category: "core", faculty: fLovelace._id, description: "Microcontrollers, peripheral interfacing, RTOS scheduling, and debugging." },
      { name: "VLSI Design", code: "EC702", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "B1", capacity: 60, category: "core", faculty: fShannon._id, description: "CMOS layout, combinational circuit propagation, and digital design verification." },
      { name: "Wireless Communication", code: "EC703", credits: 3, semester: 7, branch: "ECE", department: "ECE", slot: "C2", capacity: 60, category: "elective", faculty: fLovelace._id, description: "Cellular signal propagation models, MIMO systems, and 5G cellular networks." },
      
      // CSE Semester 3
      { name: "Data Structures", code: "CS301", credits: 4, semester: 3, branch: "CSE", department: "CSE", slot: "A2", capacity: 60, category: "core", faculty: fKnuth._id, description: "Linked Lists, Stack and Queue implementations, Tree traversals, and Sorting." },
      { name: "Discrete Mathematics", code: "CS201", credits: 4, semester: 3, branch: "CSE", department: "CSE", slot: "B1", capacity: 60, category: "core", faculty: fJohnson._id, description: "Combinatorics, graph theory modeling, relations, logic functions, and proofs." },
      { name: "Computer Organization", code: "CS302", credits: 3, semester: 3, branch: "CSE", department: "CSE", slot: "C1", capacity: 60, category: "core", faculty: fNeumann._id, description: "CPU architecture, memory hierarchies, cache maps, instruction pipelining, and bus links." },
      
      // ECE Semester 3
      { name: "Network Theory", code: "EC301", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "A2", capacity: 60, category: "core", faculty: fShannon._id, description: "Kirchhoff laws, node/mesh linear loop solving, and active filter topologies." },
      
      // CSE Semester 5
      { name: "Operating Systems", code: "CS401", credits: 4, semester: 5, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "core", faculty: fRitchie._id, description: "Process scheduling, thread race conditions, semaphore locks, and virtual memory." },
      { name: "Database Management Systems", code: "CS402", credits: 4, semester: 5, branch: "CSE", department: "CSE", slot: "B2", capacity: 60, category: "core", faculty: fLiskov._id, description: "SQL database queries, schema normalization rules, indexes, and ACID transactions." },
      { name: "Theory of Computation", code: "CS501", credits: 3, semester: 5, branch: "CSE", department: "CSE", slot: "A1", capacity: 60, category: "core", faculty: fTuring._id, description: "DFAs, context-free grammars, Turing machines, decidability, and Complexity classes." },
      { name: "Software Engineering", code: "CS502", credits: 3, semester: 5, branch: "CSE", department: "CSE", slot: "C2", capacity: 60, category: "core", faculty: fHamilton._id, description: "Waterfall and Agile design models, design patterns, testing strategies, and Git." },

      // CSE Semester 1 & 6
      { name: "Introduction to Programming", code: "CS101", credits: 4, semester: 1, branch: "CSE", department: "CSE", slot: "A1", capacity: 60, category: "core", faculty: fRitchie._id, description: "Procedural language foundations in C, arrays, functions, pointers, and memory blocks." },
      { name: "Computer Networks", code: "CS601", credits: 4, semester: 6, branch: "CSE", department: "CSE", slot: "B1", capacity: 60, category: "core", faculty: fVint._id, description: "OSI Layer standards, IP subnet routing, TCP sliding window, and HTTP protocol." },
      { name: "Compiler Design", code: "CS602", credits: 4, semester: 6, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "core", faculty: fHopper._id, description: "Lexical analyzers, LL/LR parsing tables, intermediate code representation, and optimization." },
      
      // General Engineering Semester 1
      { name: "Basic Electrical Engineering", code: "EC101", credits: 4, semester: 1, branch: "ECE", department: "ECE", slot: "B1", capacity: 60, category: "core", faculty: fShannon._id, description: "AC/DC voltage sources, active/reactive loads, transformers, and electrical machines." },
      { name: "Engineering Mechanics", code: "ME101", credits: 4, semester: 1, branch: "ME", department: "ME", slot: "A1", capacity: 60, category: "core", faculty: fFeynman._id, description: "Static structures, free-body diagrams, friction vectors, and moment calculations." },
      
      // ME Semester 3, 5, 7
      { name: "Thermodynamics", code: "ME301", credits: 4, semester: 3, branch: "ME", department: "ME", slot: "B2", capacity: 60, category: "core", faculty: fFeynman._id, description: "First and Second laws of thermodynamics, Carnot cycle, and steam tables." },
      { name: "Fluid Mechanics", code: "ME501", credits: 4, semester: 5, branch: "ME", department: "ME", slot: "C1", capacity: 60, category: "core", faculty: fHawking._id, description: "Fluid statics, Bernoulli equation, pipe flow friction losses, and dimensional analysis." },
      { name: "CAD/CAM", code: "ME701", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "D1", capacity: 60, category: "core", faculty: fFeynman._id, description: "Computer-aided geometric design curves, CNC toolpath programming, and 3D printing." },

      // Physics/Chemistry Core (Semester 1)
      { name: "Engineering Physics", code: "PH101", credits: 4, semester: 1, branch: "all", department: "Physics", slot: "C1", capacity: 60, category: "core", faculty: fHawking._id, description: "Quantum mechanics principles, wave packets, optical fibers, and laser systems." },
      { name: "Engineering Chemistry", code: "CH101", credits: 4, semester: 1, branch: "all", department: "Chemistry", slot: "D1", capacity: 60, category: "core", faculty: fCurie._id, description: "Chemical kinetics, molecular orbital theory, polymer compounds, and electrochemistry." },

      // Advanced Electives (Semester 8)
      { name: "Deep Learning", code: "CS801", credits: 4, semester: 8, branch: "CSE", department: "CSE", slot: "A1", capacity: 60, category: "elective", faculty: fTuring._id, description: "Neural network layers, backpropagation, CNN architectures, and GAN networks." },
      { name: "Blockchain Technology", code: "CS802", credits: 3, semester: 8, branch: "CSE", department: "CSE", slot: "D2", capacity: 60, category: "elective", faculty: fThompson._id, description: "Distributed ledgers, smart contract scripting, consensus protocols, and cryptography." },
      { name: "Distributed Databases", code: "CS803", credits: 3, semester: 8, branch: "CSE", department: "CSE", slot: "B2", capacity: 60, category: "elective", faculty: fLiskov._id, description: "Cassandra architecture, Dynamo replication, consistency models, and partition maps." }
    ];

    const courses = await Course.create(coursesData);
    console.log(`Created ${courses.length} courses.`);

    // Keep references to specific courses for relations
    const mlCourse = courses.find(c => c.code === "CS701");
    const dsCourse = courses.find(c => c.code === "CS702");
    const ecCourse = courses.find(c => c.code === "EC701");
    const dataStrCourse = courses.find(c => c.code === "CS301");

    // Enroll students in core courses to populate enrolledStudent lists
    mlCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await mlCourse.save();

    dsCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await dsCourse.save();

    ecCourse.enrolledStudents.push(priya._id);
    await ecCourse.save();

    dataStrCourse.enrolledStudents.push(rahul._id);
    await dataStrCourse.save();

    // 6. Create Registration Windows
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

    // 7. Create Notices
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
        createdBy: fTuring._id
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

    // 8. Create Assignments
    await Assignment.create([
      {
        title: "Gradient Descent Implementation",
        description: "Implement Batch and Stochastic Gradient Descent from scratch in Python. Do not use sklearn.",
        course: mlCourse._id,
        faculty: fTuring._id,
        totalMarks: 100,
        dueDate: fourDaysLater
      },
      {
        title: "Raft Consensus Design",
        description: "Write a design document detailing the leader election and log replication mechanisms in your Raft implementation.",
        course: dsCourse._id,
        faculty: fHopper._id,
        totalMarks: 100,
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log("Created assignments.");

    // 9. Create Past Results
    // CSE Semester 6 Course IDs (mocked to ML / DS / Cryptography for simplicity)
    await Result.create([
      {
        student: ujjwal._id,
        course: mlCourse._id,
        semester: 6,
        totalMarks: 88,
        maxMarks: 100,
        uploadedBy: fTuring._id
      },
      {
        student: ujjwal._id,
        course: dsCourse._id,
        semester: 6,
        totalMarks: 95,
        maxMarks: 100,
        uploadedBy: fHopper._id
      },
      {
        student: amit._id,
        course: mlCourse._id,
        semester: 6,
        totalMarks: 80,
        maxMarks: 100,
        uploadedBy: fTuring._id
      }
    ]);
    console.log("Created results.");

    // 10. Create Timetable
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
          faculty: fTuring._id,
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
          faculty: fHopper._id,
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
          faculty: fTuring._id,
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
          faculty: fHopper._id,
          courseName: dsCourse.name,
          courseCode: dsCourse.code
        }
      ]
    });
    console.log("Created timetable.");

    console.log("Comprehensive database seeded successfully! 🎉");
    return { success: true, message: "Comprehensive demo database seeded successfully!" };
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
