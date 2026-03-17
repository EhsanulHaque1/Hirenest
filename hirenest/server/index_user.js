/* global process */
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import connectDB from "./connect.cjs";
import User from "./models/User.js";
import aiRoutes from "./routes/aiRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import verifyToken from "./middleware/auth.js";

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5003; // use env port if available

app.use(cors());
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/complaints", complaintRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Connect to MongoDB
connectDB();

// Secret key for JWT
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-change-in-production-12345";

// ----------------- REGISTER -----------------
app.post("/api/auth/register", async (req, res) => {
  const { firstName, lastName, email, username, password, role } = req.body;

  if (!firstName || !lastName || !email || !username || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res.status(409).json({ error: "Username or email already taken" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      passwordHash,
      role,
    });

    await user.save();

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    // Optional: generate token on registration
    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });

    // Optionally send verification email
    // await sendVerificationEmail(user.email, token);

    return res.status(201).json({ user: safeUser, token });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ----------------- LOGIN -----------------
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const safeUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    // Generate JWT
    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ user: safeUser, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// ----------------- PROTECTED ROUTE EXAMPLE -----------------
app.get("/api/protected", verifyToken, (req, res) => {
  // verifyToken adds req.user
  res.json({ message: "Access granted", user: req.user });
});

// ----------------- START SERVER -----------------
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
