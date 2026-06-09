import express from 'express';
import { logContentView, getContentHistory } from '../controllers/contentLog.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, logContentView)
  .get(protect, getContentHistory);

export default router;