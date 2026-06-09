import express from 'express';
import {
  getAllReports,
  getLatestReport,
  markReportAsRead,
} from '../controllers/report.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/').get(protect, getAllReports);
router.route('/latest').get(protect, getLatestReport);
router.route('/:id/read').patch(protect, markReportAsRead);

export default router;