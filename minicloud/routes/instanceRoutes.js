import express from 'express';
import * as instanceController from '../controllers/instanceController.js';

const router = express.Router();

router.post('/create', instanceController.createInstance);
router.get('/list', instanceController.listInstances);
router.put('/stop/:id', instanceController.stopInstance);
router.put('/start/:id', instanceController.startInstance);
router.delete('/delete/:id', instanceController.deleteInstance);

export default router;
