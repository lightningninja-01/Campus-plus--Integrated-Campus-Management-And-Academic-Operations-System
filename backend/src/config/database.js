const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);

    if (error.name) {
      console.error("Error type:", error.name);
    }

    if (error.code) {
      console.error("Error code:", error.code);
    }

    process.exit(1);
  }
};

module.exports = connectDB;
