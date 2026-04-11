import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    // Handle admin user case - find admin by role if userId is "admin" string
    let finalUserId = userId;
    if (typeof userId === 'string' && (userId === 'admin' || userId === 'admin-token')) {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        finalUserId = adminUser._id;
      } else {
        console.log("No admin user found in database, skipping notification");
        return null;
      }
    }

    const notification = new Notification({
      userId: finalUserId,
      type,
      title,
      message,
      relatedId,
      relatedType
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

export const getNotifications = async (req, res) => {
  try {
    let userId = req.user.id;
    
    // Handle admin user case - find admin by role if userId is "admin" string
    if (userId === 'admin') {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        userId = adminUser._id.toString();
      } else {
        // Admin user doesn't exist in database yet, return empty
        return res.json({ notifications: [], unreadCount: 0 });
      }
    }
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    let userId = req.user.id;
    
    // Handle admin user case
    if (userId === 'admin') {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        userId = adminUser._id.toString();
      } else {
        return res.json({ success: true });
      }
    }
    
    const { notificationId } = req.params;

    if (notificationId) {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );
    } else {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    let userId = req.user.id;
    
    // Handle admin user case
    if (userId === 'admin') {
      const adminUser = await User.findOne({ role: "admin" });
      if (adminUser) {
        userId = adminUser._id.toString();
      } else {
        return res.json({ success: true });
      }
    }
    
    const { notificationId } = req.params;

    await Notification.findOneAndDelete({ _id: notificationId, userId });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};