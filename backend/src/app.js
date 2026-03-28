const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const { Server } = require("socket.io");
const StudyGroup = require("./models/StudyGroup");
const { parseBearerToken, verifyToken } = require("./middleware/auth.middleware");

const authRoutes        = require("./routes/auth.routes");
const eventRoutes       = require("./routes/event.routes");
const courseRoutes      = require("./routes/course.routes");
const assignmentRoutes  = require("./routes/assignment.routes");
const attendanceRoutes  = require("./routes/attendance.routes");
const resultRoutes      = require("./routes/result.routes");
const noticeRoutes      = require("./routes/notice.routes");
const studyGroupRoutes  = require("./routes/studygroup.routes");
const messageRoutes     = require("./routes/message.routes");
const timetableRoutes   = require("./routes/timetable.routes");

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://campus-plus-integrated-campus-manag.vercel.app", process.env.FRONTEND_URL || ""],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.use((socket, next) => {
  try {
    const authToken = socket.handshake.auth?.token;
    const bearerToken = parseBearerToken(socket.handshake.headers?.authorization || "");
    const token = authToken || bearerToken;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    socket.user = verifyToken(token);
    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_group", async (groupId) => {
    try {
      const group = await StudyGroup.findById(groupId).select("members");
      const isMember = group?.members?.some(
        (memberId) => String(memberId) === String(socket.user.id)
      );

      if (!isMember) {
        socket.emit("socket_error", { message: "Not authorized for this group" });
        return;
      }

      socket.join(groupId);
    } catch (error) {
      socket.emit("socket_error", { message: "Unable to join group" });
    }
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
  origin: ["http://localhost:5173", "https://campus-plus-integrated-campus-manag.vercel.app", process.env.FRONTEND_URL || ""],
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
app.use("/timetable",   timetableRoutes);

// Export server for Socket.io support
module.exports = { app, server };
