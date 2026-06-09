import express from 'express';
import { createBadge, getAllBadges } from '../controllers/badge.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBadge)
  .get(protect, getAllBadges);

export default router;