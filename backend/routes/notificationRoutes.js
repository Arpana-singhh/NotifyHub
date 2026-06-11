import express from 'express';
import { getNotifications, getNotificationById, markAsRead, markAllAsRead, getCount, deleteNotification } from '../controller/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/notifications/count', authMiddleware, getCount);
router.get('/notifications', authMiddleware, getNotifications);
router.get('/notifications/:id', authMiddleware, getNotificationById);
router.patch('/notifications/:id/read', authMiddleware, markAsRead);
router.patch('/notifications/read-all', authMiddleware, markAllAsRead);
router.delete('/notifications/:id', authMiddleware, deleteNotification);

export default router;
