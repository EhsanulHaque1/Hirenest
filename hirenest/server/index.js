/* global process */

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./connect.cjs";
import User from "./models/User.js";
import Message from "./models/Chat.js";
import Conversation from "./models/Conversation.js";
import { createNotification } from "./controllers/notificationController.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./utils/emailService.js";
import aiRoutes from "./routes/aiRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import verifyToken from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Load environment variables */
dotenv.config({ path: path.join(__dirname, "config.env") });

const app = express();
const PORT = process.env.PORT || 5004;

/* Middleware */
app.use(cors({
  origin: true, // Allow all origins when credentials are needed
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

/* Create HTTP server with Socket.io */
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

/* Connect Database */
connectDB();

/* Routes */
app.use("/api/ai", aiRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

/* Socket.io Authentication Middleware */
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

/* Socket.io Connection Handler */
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user's personal room
  socket.join(socket.userId);

  // Handle joining a chat room with another user
  socket.on("join_chat", (otherUserId) => {
    const roomId = [socket.userId, otherUserId].sort().join("_");
    socket.join(roomId);
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (data) => {
    try {
      const { receiverId, content } = data;

      // Create message in database
      const message = new Message({
        senderId: socket.userId,
        receiverId,
        content,
      });
      await message.save();

      // Update conversation
      const conversation = await Conversation.findOrCreateConversation(
        socket.userId,
        receiverId,
      );
      conversation.lastMessage = message._id;
      conversation.lastMessageAt = new Date();
      await conversation.incrementUnread(receiverId);

      // Populate sender info
      const populatedMessage = await Message.findById(message._id)
        .populate("senderId", "firstName lastName username profilePicture")
        .populate("receiverId", "firstName lastName username profilePicture");

      // Emit to both users
      const roomId = [socket.userId, receiverId].sort().join("_");
      io.to(roomId).emit("new_message", populatedMessage);

      // Create notification for receiver
      const sender = await User.findById(socket.userId).select('firstName lastName');
      await createNotification(
        receiverId,
        'newMessage',
        'New Message',
        `${sender.firstName} ${sender.lastName} sent you a message`,
        conversation._id,
        'Chat'
      );

      // Also emit notification to receiver
      io.to(receiverId).emit("message_notification", {
        conversationId: conversation._id,
        message: populatedMessage,
      });
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    const roomId = [socket.userId, receiverId].sort().join("_");
    socket.to(roomId).emit("user_typing", {
      userId: socket.userId,
      isTyping,
    });
  });

  // Handle mark as read
  socket.on("mark_read", async (data) => {
    try {
      const { otherUserId } = data;

      await Message.updateMany(
        { senderId: otherUserId, receiverId: socket.userId, read: false },
        { read: true },
      );

      const conversation = await Conversation.findOne({
        participants: { $all: [socket.userId, otherUserId] },
      });

      if (conversation) {
        await conversation.markAsRead(socket.userId);
      }

      const roomId = [socket.userId, otherUserId].sort().join("_");
      io.to(roomId).emit("messages_read", {
        readerId: socket.userId,
        readerName: "User",
      });
    } catch (error) {
      console.error("Mark read error:", error);
    }
  });

  // Handle message deletion
  socket.on("message_deleted", async (data) => {
    try {
      const { messageId, receiverId } = data;

      // Emit to both users in the room
      const roomId = [socket.userId, receiverId].sort().join("_");
      io.to(roomId).emit("message_deleted", { messageId });
    } catch (error) {
      console.error("Message deletion error:", error);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Export io for use in routes
export { io };

import multer from "multer";
import { uploadToCloudinary } from "./middleware/upload.js";
import {
  completeProfile,
  getProfile,
  updateProfile,
} from "./controllers/profileController.js";

// Profile routes - append
app.get("/api/auth/profile", verifyToken, getProfile);

app.put(
  "/api/auth/profile",
  multer({ storage: multer.memoryStorage() }).fields([
    { name: "certificationImages", maxCount: 5 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  verifyToken,
  updateProfile,
);

app.put(
  "/api/auth/complete-profile",
  multer({ storage: multer.memoryStorage() }).fields([
    { name: "nidImages", maxCount: 2 },
    { name: "certificationImages", maxCount: 5 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  verifyToken,
  completeProfile,
);

// Get user profile by ID (for viewing other users' profiles)
app.get("/api/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select(
      "-passwordHash -verificationToken",
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   ADMIN ROUTES
========================= */

// Get all users (admin only)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash -verificationToken");
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get admin statistics
app.get("/api/admin/stats", async (req, res) => {
  try {
    const Complaint = (await import("./models/Complaint.js")).default;

    const totalUsers = await User.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({
      status: "pending",
    });
    const resolvedComplaints = await Complaint.countDocuments({
      status: "resolved",
    });

    res.json({
      totalUsers,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update complaint status (admin only)
app.patch("/api/complaints/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionMessage } = req.body;
    const Complaint = (await import("./models/Complaint.js")).default;

    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updateData = { status };
    if (resolutionMessage) {
      updateData.resolutionMessage = resolutionMessage;
    }

    const complaint = await Complaint.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json(complaint);
  } catch (error) {
    console.error("Update complaint status error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all complaints (admin only)
app.get("/api/complaints/all", async (req, res) => {
  try {
    const Complaint = (await import("./models/Complaint.js")).default;
    const complaints = await Complaint.find()
      .populate("userId", "firstName lastName email username")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Get all complaints error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (admin only)
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete complaint (admin only)
app.delete("/api/complaints/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const Complaint = (await import("./models/Complaint.js")).default;
    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Delete complaint error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* Health check */
app.get("/api/health", (req, res) => {
  res.json({ status: "Server running" });
});

// Centralized Error Handler (must be last middleware)
app.use(errorHandler);

/* =========================
   REGISTER USER
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    if (!firstName || !lastName || !email || !username || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email or username already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      firstName,
      lastName,
      email,
      username,
      passwordHash,
      role,
      isVerified: false,
      profileComplete: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   LOGIN USER
========================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username/email and password required" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        error: "Please verify your email before logging in",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      role: user.role,
      profileComplete: user.profileComplete,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   EMAIL VERIFICATION
========================= */

app.get("/api/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   RESEND VERIFICATION
========================= */

app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res
        .status(400)
        .json({ error: "Invalid email or already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({ message: "Verification email resent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */

app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No account found with this email" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   RESET PASSWORD
========================= */

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   PROTECTED ROUTE
========================= */

app.get("/api/auth/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

/* =========================
   START SERVER
========================= */

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
