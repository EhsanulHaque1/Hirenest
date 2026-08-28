const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config.env") });
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hirenest",
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    // log error but do not terminate process; front-end services are static and
    // the application should still respond to API requests during development
    console.error("MongoDB connection failed:", error.message);
    // process.exit(1);
  }
};

// Call connectDB if this file is run directly (for testing)
if (require.main === module) {
  connectDB();
}

module.exports = connectDB;
