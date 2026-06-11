import express from 'express';
import { getUser, updateUser } from '../controller/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user', authMiddleware, getUser);
router.put('/user', authMiddleware, updateUser);

export default router;
 