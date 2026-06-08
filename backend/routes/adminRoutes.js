import express from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUserById, toggleBlockUser } from '../controller/adminUserController.js';
import { createNotification, adminDeleteNotification } from '../controller/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserById);
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUserById);
router.patch('/users/:id/block', authMiddleware, adminMiddleware, toggleBlockUser);
router.patch('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);

router.post('/notifications', authMiddleware, adminMiddleware, createNotification);
router.delete('/notifications/:id', authMiddleware, adminMiddleware, adminDeleteNotification);

export default router;
