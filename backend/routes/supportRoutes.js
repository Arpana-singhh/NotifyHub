import express from 'express';
import { createSupportTicket, getAllSupportTickets, toggleSupportTicket, deleteSupportTicket } from '../controller/supportController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.post('/support', authMiddleware, createSupportTicket);
router.get('/admin/support', authMiddleware, adminMiddleware, getAllSupportTickets);
router.patch('/admin/support/:id/toggle', authMiddleware, adminMiddleware, toggleSupportTicket);
router.delete('/admin/support/:id', authMiddleware, adminMiddleware, deleteSupportTicket);

export default router;
