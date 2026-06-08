import express from 'express';
import { getNotifications, getNotificationById, markAsRead, getUnreadCount, deleteNotification } from '../controller/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/notifications/unread-count', authMiddleware, getUnreadCount);
router.get('/notifications', authMiddleware, getNotifications);
router.get('/notifications/:id', authMiddleware, getNotificationById);
router.patch('/notifications/:id/read', authMiddleware, markAsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);

export default router;
