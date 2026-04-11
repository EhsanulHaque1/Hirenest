import express from "express";
import {
  getNotifications,
  markAsRead,
  deleteNotification
} from "../controllers/notificationController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/read/:notificationId', verifyToken, markAsRead);
router.patch('/read-all', verifyToken, markAsRead);
router.delete('/:notificationId', verifyToken, deleteNotification);

export default router;