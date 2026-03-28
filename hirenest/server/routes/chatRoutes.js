import express from "express";
import verifyToken from "../middleware/auth.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  searchUsers,
  markAsRead,
  deleteMessage,
  deleteConversation,
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all conversations
router.get("/conversations", getConversations);

// Get messages with a specific user
router.get("/messages/:otherUserId", getMessages);

// Send a new message
router.post("/messages", sendMessage);

// Search users to start conversation
router.get("/users/search", searchUsers);

// Mark messages as read
router.patch("/messages/:otherUserId/read", markAsRead);

// Delete a message
router.delete("/messages/:messageId", deleteMessage);

// Delete entire conversation
router.delete("/conversations/:otherUserId", deleteConversation);

export default router;
