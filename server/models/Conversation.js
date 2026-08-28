import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    jobContext: {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      jobTitle: String,
    },
  },
  { timestamps: true },
);

// Index for finding user's conversations
conversationSchema.index({ participants: 1, lastMessageAt: -1 });

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find((p) => p.toString() !== userId.toString());
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function (
  userId1,
  userId2,
  jobContext = null,
) {
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (!conversation) {
    conversation = new this({
      participants: [userId1, userId2],
      jobContext,
    });
    await conversation.save();
  }

  return conversation;
};

// Update unread count for a user
conversationSchema.methods.incrementUnread = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

// Mark as read for a user
conversationSchema.methods.markAsRead = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
