const express = require("express");
const cors = require("cors");

const authRoutes       = require("./routes/auth.routes");
const eventRoutes      = require("./routes/event.route");
const courseRoutes     = require("./routes/course.routes");
const assignmentRoutes = require("./routes/assignment.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const resultRoutes     = require("./routes/result.routes");
const noticeRoutes     = require("./routes/notice.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Campus+ Backend Running 🚀"));

app.use("/auth",        authRoutes);
app.use("/events",      eventRoutes);
app.use("/courses",     courseRoutes);
app.use("/assignments", assignmentRoutes);
app.use("/attendance",  attendanceRoutes);
app.use("/results",     resultRoutes);
app.use("/notices",     noticeRoutes);

module.exports = app;