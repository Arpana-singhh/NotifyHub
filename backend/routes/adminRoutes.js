import express from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUserById, toggleBlockUser } from '../controller/adminUserController.js';
import { createNotification, adminDeleteNotification, adminDeleteUserNotification, adminGetAllNotifications, adminGetDashboardStats, getNotificationChartData } from '../controller/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUserById);
router.patch('/users/:id/block', authMiddleware, adminMiddleware, toggleBlockUser);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);

router.get('/dashboard/stats', authMiddleware, adminMiddleware, adminGetDashboardStats);
router.get('/dashboard/chart', authMiddleware, adminMiddleware, getNotificationChartData);
router.get('/notifications', authMiddleware, adminMiddleware, adminGetAllNotifications);
router.post('/notifications', authMiddleware, adminMiddleware, createNotification);
router.delete('/notifications', authMiddleware, adminMiddleware, adminDeleteNotification);
router.delete('/notifications/user', authMiddleware, adminMiddleware, adminDeleteUserNotification);

export default router;
