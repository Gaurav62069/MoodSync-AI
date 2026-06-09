import express from 'express';
import { logSleep, getSleepHistory } from '../controllers/sleep.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, logSleep)
  .get(protect, getSleepHistory);

export default router;