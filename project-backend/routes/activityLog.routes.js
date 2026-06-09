import express from 'express';
import { logActivity,getActivityStats } from '../controllers/activityLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router.post('/', protect, logActivity);
router.get('/stats', protect, getActivityStats);
export default router;