import Message from "../models/Chat.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate(
        "participants",
        "firstName lastName username profilePicture role",
      )
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    // Get unread counts
    const conversationsWithUnread = conversations.map((conv) => {
      const otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId,
      );
      return {
        _id: conv._id,
        otherUser: otherUser
          ? {
              _id: otherUser._id,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
              username: otherUser.username,
              profilePicture: otherUser.profilePicture,
              role: otherUser.role,
            }
          : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount: conv.unreadCount.get(userId) || 0,
        jobContext: conv.jobContext,
      };
    });

    res.json(conversationsWithUnread);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify conversation exists
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await Message.find({
      $and: [
        { $or: [{ senderId: userId }, { receiverId: userId }] },
        { $or: [{ senderId: otherUserId }, { receiverId: otherUserId }] },
        { deletedBy: { $ne: userId } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("senderId", "firstName lastName username profilePicture")
      .populate("receiverId", "firstName lastName username profilePicture");

    // Mark messages as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, read: false },
      { read: true },
    );

    // Reset unread count
    await conversation.markAsRead(userId);

    res.json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Send a new message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content, jobContext } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ error: "Receiver and content required" });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreateConversation(
      senderId,
      receiverId,
      jobContext,
    );

    // Create message
    const message = new Message({
      senderId,
      receiverId,
      content,
    });
    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastMessageAt = new Date();
    await conversation.incrementUnread(receiverId);
    await conversation.save();

    // Populate sender info for response
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "firstName lastName username profilePicture")
      .populate("receiverId", "firstName lastName username profilePicture");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Search users to start a conversation
export const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { query, role } = req.query;

    let searchQuery = {
      _id: { $ne: currentUserId },
      isVerified: true,
    };

    if (query) {
      searchQuery.$or = [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ];
    }

    if (role) {
      searchQuery.role = role;
    }

    const users = await User.find(searchQuery)
      .select("firstName lastName username profilePicture role")
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, read: false },
      { read: true },
    );

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (conversation) {
      await conversation.markAsRead(userId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (message.senderId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    message.deletedBy.push(userId);
    await message.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
