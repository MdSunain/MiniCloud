import express from 'express';
import * as instanceController from '../controllers/instanceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/create', authMiddleware, instanceController.createInstance);
router.get('/list', authMiddleware, instanceController.listInstances);
router.put('/stop/:id', authMiddleware, instanceController.stopInstance);
router.put('/start/:id', authMiddleware, instanceController.startInstance);
router.delete('/delete/:id', authMiddleware, instanceController.deleteInstance);

export default router;
