const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");

const authRoutes        = require("./routes/auth.routes");
const eventRoutes       = require("./routes/event.route");
const courseRoutes      = require("./routes/course.routes");
const assignmentRoutes  = require("./routes/assignment.routes");
const attendanceRoutes  = require("./routes/attendance.routes");
const resultRoutes      = require("./routes/result.routes");
const noticeRoutes      = require("./routes/notice.routes");
const studyGroupRoutes  = require("./routes/studygroup.routes");
const messageRoutes     = require("./routes/message.routes");

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL || ""],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_group", (groupId) => {
    socket.join(groupId);
  });

  socket.on("leave_group", (groupId) => {
    socket.leave(groupId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL || ""],
  credentials: true,
}));
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.send("Campus+ Backend Running 🚀"));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/auth",        authRoutes);
app.use("/events",      eventRoutes);
app.use("/courses",     courseRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/attendance",  attendanceRoutes);
app.use("/results",     resultRoutes);
app.use("/notices",     noticeRoutes);
app.use("/studygroups", studyGroupRoutes);
app.use("/messages",    messageRoutes);

// Export server for Socket.io support
module.exports = { app, server };