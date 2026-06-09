import express from 'express';
import { logMood, getMoodHistory } from '../controllers/mood.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
router
  .route('/')
  .post(protect, logMood)
  .get(protect, getMoodHistory);

export default router;