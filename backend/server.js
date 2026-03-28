require("dotenv").config();

const { app, server } = require("./src/app");
const connectDB = require("./src/config/database");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Use server.listen (not app.listen) to support Socket.io
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();