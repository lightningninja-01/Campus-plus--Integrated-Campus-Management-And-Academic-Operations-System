const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.route");

const authMiddleware = require("./middleware/auth.middleware");

const app = express();


// =============================
// MIDDLEWARE
// =============================

app.use(cors());
app.use(express.json());


// =============================
// HEALTH CHECK
// =============================

app.get("/", (req, res) => {
  res.send("Campus+ Backend Running 🚀");
});


// =============================
// AUTH ROUTES
// =============================

app.use("/auth", authRoutes);


// =============================
// EVENT ROUTES
// =============================

app.use("/events", eventRoutes);


// =============================
// PROTECTED TEST ROUTE
// =============================

app.get("/profile", authMiddleware, (req, res) => {

  res.json({
    message: "Protected route accessed successfully",
    user: req.user
  });

});


// =============================
// EXPORT APP
// =============================

module.exports = app;
