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

    // 3. Create 30 Faculty Members
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
      { name: "Dr. Katherine Johnson", email: "johnson@campus.edu", department: "Math", designation: "Professor" },
      { name: "Dr. Nikola Tesla", email: "tesla@campus.edu", department: "ECE", designation: "Professor" },
      { name: "Dr. John Bardeen", email: "bardeen@campus.edu", department: "ECE", designation: "Professor" },
      { name: "Dr. William Shockley", email: "shockley@campus.edu", department: "ECE", designation: "Associate Professor" },
      { name: "Dr. Walter Brattain", email: "brattain@campus.edu", department: "ECE", designation: "Assistant Professor" },
      { name: "Dr. Henry Ford", email: "ford@campus.edu", department: "ME", designation: "Professor" },
      { name: "Dr. Nikolaus Otto", email: "otto@campus.edu", department: "ME", designation: "Associate Professor" },
      { name: "Dr. Rudolf Diesel", email: "diesel@campus.edu", department: "ME", designation: "Professor" },
      { name: "Dr. Albert Einstein", email: "einstein@campus.edu", department: "Physics", designation: "Professor" },
      { name: "Dr. Niels Bohr", email: "bohr@campus.edu", department: "Physics", designation: "Professor" },
      { name: "Dr. Werner Heisenberg", email: "heisenberg@campus.edu", department: "Physics", designation: "Professor" }
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

    const [
      fTuring, fHopper, fLovelace, fNeumann, fShannon, 
      fHamilton, fLiskov, fKnuth, fRitchie, fThompson, 
      fTorvalds, fTim, fBjarne, fVint, fGosling, 
      fGuido, fHawking, fFeynman, fCurie, fJohnson,
      fTesla, fBardeen, fShockley, fBrattain, fFord,
      fOtto, fDiesel, fEinstein, fBohr, fHeisenberg
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

    // 5. Create 40+ Courses with curriculum-specific credits mapping
    const coursesData = [
      // ── CSE Semester 7 ──
      // Cores (5 courses * 4 credits = 20 credits)
      { name: "Machine Learning", code: "CS701", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "A1", capacity: 60, category: "core", faculty: fTuring._id, description: "Introduction to Supervised, Unsupervised, and Deep Learning algorithms." },
      { name: "Distributed Systems", code: "CS702", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "B1", capacity: 60, category: "core", faculty: fHopper._id, description: "Concepts of replication, consistency models, consensus protocol (Raft/Paxos), and RPCs." },
      { name: "Internet of Things", code: "CS706", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "core", faculty: fHamilton._id, description: "Sensors, actuators, microcontroller programming, and cloud telemetry." },
      { name: "Software Architecture", code: "CS707", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "E1", capacity: 60, category: "core", faculty: fLiskov._id, description: "Architectural patterns, microservices, containerization, and system design." },
      { name: "Information Retrieval", code: "CS708", credits: 4, semester: 7, branch: "CSE", department: "CSE", slot: "F1", capacity: 60, category: "core", faculty: fKnuth._id, description: "Text indexing, vector space models, web search engines, and PageRank algorithms." },

      // Electives (4 options * 2 credits, choose 1)
      { name: "Cloud Computing", code: "CS703", credits: 2, semester: 7, branch: "CSE", department: "CSE", slot: "C1", capacity: 60, category: "elective", faculty: fNeumann._id, description: "AWS cloud architectures, Lambda functions, and serverless computing." },
      { name: "Natural Language Processing", code: "CS704", credits: 2, semester: 7, branch: "CSE", department: "CSE", slot: "C1", capacity: 60, category: "elective", faculty: fHopper._id, description: "Foundations of NLP, LSTM models, Attention mechanisms, and Transformers." },
      { name: "Cryptography & Network Security", code: "CS705", credits: 2, semester: 7, branch: "CSE", department: "CSE", slot: "G1", capacity: 60, category: "elective", faculty: fShannon._id, description: "Symmetric and asymmetric encryption, public key infrastructure, and SSL/TLS." },
      { name: "Computer Graphics", code: "CS709", credits: 2, semester: 7, branch: "CSE", department: "CSE", slot: "H1", capacity: 60, category: "elective", faculty: fThompson._id, description: "Rasterization, vector rendering, projections, and GPU pipeline modeling." },

      // VAC (Value Added Courses) (3 options * 2 credits, choose 1)
      { name: "Ethical Hacking Foundations", code: "VAC701", credits: 2, semester: 7, branch: "all", department: "CSE", slot: "I1", capacity: 60, category: "vac", faculty: fRitchie._id, description: "Penetration testing, network footprinting, vulnerabilities, and defenses." },
      { name: "Yoga and Wellness", code: "VAC702", credits: 2, semester: 7, branch: "all", department: "Chemistry", slot: "J1", capacity: 60, category: "vac", faculty: fCurie._id, description: "Mental health guidance, posture drills, and physical well-being methods." },
      { name: "Professional Communication", code: "VAC703", credits: 2, semester: 7, branch: "all", department: "Math", slot: "K1", capacity: 60, category: "vac", faculty: fJohnson._id, description: "Written and oral presentation rules, mock interviews, and group work." },

      // ── ECE Semester 7 ──
      // Cores (5 courses * 4 credits = 20 credits)
      { name: "Embedded Systems", code: "EC701", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "A1", capacity: 60, category: "core", faculty: fLovelace._id, description: "Microcontrollers, peripheral interfacing, RTOS scheduling, and debugging." },
      { name: "VLSI Design", code: "EC702", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "B1", capacity: 60, category: "core", faculty: fShannon._id, description: "CMOS layout, combinational circuit propagation, and digital design verification." },
      { name: "Digital Image Processing", code: "EC704", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "D1", capacity: 60, category: "core", faculty: fHopper._id, description: "Frequency domain transforms, edge detection, filtering, and compression." },
      { name: "Microwave Engineering", code: "EC705", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "E1", capacity: 60, category: "core", faculty: fShannon._id, description: "Waveguides, transmission line matching networks, and antenna equations." },
      { name: "Control Systems", code: "EC706", credits: 4, semester: 7, branch: "ECE", department: "ECE", slot: "F1", capacity: 60, category: "core", faculty: fJohnson._id, description: "Transfer functions, block diagram reduction, PID controllers, and stability." },

      // Electives (4 options * 2 credits, choose 1)
      { name: "Wireless Communication", code: "EC703", credits: 2, semester: 7, branch: "ECE", department: "ECE", slot: "C2", capacity: 60, category: "elective", faculty: fLovelace._id, description: "Cellular signal propagation models, MIMO systems, and 5G cellular networks." },
      { name: "Satellite Communication", code: "EC707", credits: 2, semester: 7, branch: "ECE", department: "ECE", slot: "G2", capacity: 60, category: "elective", faculty: fShannon._id, description: "Orbital coordinates, link calculations, transponder architectures, and GPS." },
      { name: "Fiber Optic Networks", code: "EC708", credits: 2, semester: 7, branch: "ECE", department: "ECE", slot: "H2", capacity: 60, category: "elective", faculty: fLovelace._id, description: "Total internal reflection, dispersion, laser emitters, and wavelength routing." },
      { name: "Neural Networks for ECE", code: "EC709", credits: 2, semester: 7, branch: "ECE", department: "ECE", slot: "I2", capacity: 60, category: "elective", faculty: fTuring._id, description: "Analog hardware neuron modeling, feedforward maps, and perceptrons." },

      // ── ME Semester 7 ──
      // Cores (5 courses * 4 credits = 20 credits)
      { name: "Thermodynamics", code: "ME701", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "A1", capacity: 60, category: "core", faculty: fFord._id, description: "Laws of thermodynamics, power cycles, combustion equations, and enthalpy." },
      { name: "Fluid Mechanics", code: "ME702", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "B1", capacity: 60, category: "core", faculty: fOtto._id, description: "Fluid statics, Bernoulli equation, pipe flow losses, and boundary layers." },
      { name: "Machine Design", code: "ME703", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "D1", capacity: 60, category: "core", faculty: fDiesel._id, description: "Stress analysis, fatigue design, shafts, gears, and bearing selection." },
      { name: "Heat and Mass Transfer", code: "ME704", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "E1", capacity: 60, category: "core", faculty: fFord._id, description: "Conduction, convection heat coefficients, radiation exchange, and heat exchangers." },
      { name: "CAD/CAM Systems", code: "ME705", credits: 4, semester: 7, branch: "ME", department: "ME", slot: "F1", capacity: 60, category: "core", faculty: fOtto._id, description: "Computer aided drafting, solid modeling, CNC toolpaths, and manufacturing." },

      // Electives (4 options * 2 credits, choose 1)
      { name: "Automobile Engineering", code: "ME706", credits: 2, semester: 7, branch: "ME", department: "ME", slot: "C2", capacity: 60, category: "elective", faculty: fDiesel._id, description: "Chassis design, ICE cycles, power transmissions, and braking dynamics." },
      { name: "Robotics and Automation", code: "ME707", credits: 2, semester: 7, branch: "ME", department: "ME", slot: "G2", capacity: 60, category: "elective", faculty: fTesla._id, description: "Kinematics, trajectory generation, servo motors, and robotic actuators." },
      { name: "Power Plant Engineering", code: "ME708", credits: 2, semester: 7, branch: "ME", department: "ME", slot: "H2", capacity: 60, category: "elective", faculty: fFord._id, description: "Steam and gas power plants, hydroelectric stations, and eco considerations." },
      { name: "Gas Turbines & Jet Propulsion", code: "ME709", credits: 2, semester: 7, branch: "ME", department: "ME", slot: "I2", capacity: 60, category: "elective", faculty: fDiesel._id, description: "Brayton cycle, centrifugal compressors, rocket propulsion, and nozzle designs." },

      // ── CSE Semester 3 ──
      // Cores (5 courses)
      { name: "Data Structures", code: "CS301", credits: 4, semester: 3, branch: "CSE", department: "CSE", slot: "A2", capacity: 60, category: "core", faculty: fKnuth._id, description: "Linked Lists, Stack and Queue implementations, Tree traversals, and Sorting." },
      { name: "Discrete Mathematics", code: "CS201", credits: 4, semester: 3, branch: "CSE", department: "CSE", slot: "B1", capacity: 60, category: "core", faculty: fJohnson._id, description: "Combinatorics, graph theory modeling, relations, logic functions, and proofs." },
      { name: "Computer Organization", code: "CS302", credits: 3, semester: 3, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "core", faculty: fNeumann._id, description: "CPU architecture, memory hierarchies, cache maps, instruction pipelining, and bus links." },
      { name: "Object Oriented Programming", code: "CS303", credits: 3, semester: 3, branch: "CSE", department: "CSE", slot: "E2", capacity: 60, category: "core", faculty: fBjarne._id, description: "Classes, objects, inheritance, polymorphism, templates, and exception handling in C++." },
      { name: "Digital Logic Design", code: "CS304", credits: 3, semester: 3, branch: "CSE", department: "CSE", slot: "F2", capacity: 60, category: "core", faculty: fTesla._id, description: "Boolean algebra, K-maps, multiplexers, decoders, flip-flops, and sequential circuits." },

      // ── ECE Semester 3 ──
      // Cores (5 courses)
      { name: "Network Theory", code: "EC301", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "A2", capacity: 60, category: "core", faculty: fShannon._id, description: "Kirchhoff laws, node/mesh linear loop solving, and active filter topologies." },
      { name: "Electronic Devices", code: "EC302", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "B2", capacity: 60, category: "core", faculty: fBardeen._id, description: "Semiconductor physics, PN junction diodes, BJT operation, and MOSFET equations." },
      { name: "Signals and Systems", code: "EC303", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "C2", capacity: 60, category: "core", faculty: fBrattain._id, description: "Continuous and discrete signals, LTI systems, Fourier transform, and Laplace transforms." },
      { name: "Analog Circuits", code: "EC304", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "D2", capacity: 60, category: "core", faculty: fShockley._id, description: "Biasing circuits, small-signal models, op-amps, feedback topologies, and oscillators." },
      { name: "Digital System Design", code: "EC305", credits: 3, semester: 3, branch: "ECE", department: "ECE", slot: "E2", capacity: 60, category: "core", faculty: fBardeen._id, description: "Combinational and sequential logic, Verilog/VHDL modeling, and FPGA architectures." },

      // ── CSE Semester 5 ──
      // Cores (5 courses)
      { name: "Operating Systems", code: "CS401", credits: 4, semester: 5, branch: "CSE", department: "CSE", slot: "D1", capacity: 60, category: "core", faculty: fRitchie._id, description: "Process scheduling, thread race conditions, semaphore locks, and virtual memory." },
      { name: "Database Management Systems", code: "CS402", credits: 4, semester: 5, branch: "CSE", department: "CSE", slot: "B2", capacity: 60, category: "core", faculty: fLiskov._id, description: "SQL database queries, schema normalization rules, indexes, and ACID transactions." },
      { name: "Theory of Computation", code: "CS501", credits: 3, semester: 5, branch: "CSE", department: "CSE", slot: "C1", capacity: 60, category: "core", faculty: fTuring._id, description: "DFAs, context-free grammars, Turing machines, decidability, and Complexity classes." },
      { name: "Software Engineering", code: "CS502", credits: 3, semester: 5, branch: "CSE", department: "CSE", slot: "C2", capacity: 60, category: "core", faculty: fHamilton._id, description: "Waterfall and Agile design models, design patterns, testing strategies, and Git." },
      { name: "Computer Networks", code: "CS503", credits: 3, semester: 5, branch: "CSE", department: "CSE", slot: "E2", capacity: 60, category: "core", faculty: fVint._id, description: "OSI model, TCP/IP headers, routing protocols, sliding window flow control, and DNS." }
    ];

    const courses = await Course.create(coursesData);
    console.log(`Created ${courses.length} courses.`);

    const mlCourse = courses.find(c => c.code === "CS701");
    const dsCourse = courses.find(c => c.code === "CS702");
    const iotCourse = courses.find(c => c.code === "CS706");
    const archCourse = courses.find(c => c.code === "CS707");
    const irCourse = courses.find(c => c.code === "CS708");
    const nlpCourse = courses.find(c => c.code === "CS704");
    const hackingCourse = courses.find(c => c.code === "VAC701");

    const ecCourse = courses.find(c => c.code === "EC701");
    const dataStrCourse = courses.find(c => c.code === "CS301");

    // Pre-enroll students in required core subjects to satisfy the credit locks naturally
    mlCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await mlCourse.save();

    dsCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await dsCourse.save();

    iotCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await iotCourse.save();

    archCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await archCourse.save();

    irCourse.enrolledStudents.push(ujjwal._id, amit._id);
    await irCourse.save();

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

    // CSE Semester 7 expects 24 credits (20 core + 2 elective + 2 vac)
    await RegistrationWindow.create([
      {
        semester: 7,
        branch: "all",
        startDate: threeDaysAgo,
        endDate: fourDaysLater,
        minCredits: 24,
        maxCredits: 24,
        isActive: true
      },
      {
        semester: 3,
        branch: "CSE",
        startDate: tenDaysAgo,
        endDate: twoDaysAgo,
        minCredits: 12,
        maxCredits: 20,
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
