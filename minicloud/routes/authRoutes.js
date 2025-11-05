import express from 'express';

import { registerUser, loginUser, logoutUser, deleteUser } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.delete("/delete", authMiddleware, deleteUser);

export default router;