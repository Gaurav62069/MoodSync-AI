import Report from '../models/report.model.js';
import { getAll } from '../utils/handlerFactory.util.js';
import asyncHandler from 'express-async-handler';

// Factory ka use
export const getAllReports = getAll(Report, 'reports');

// Custom function: Sirf latest unread report laane ke liye
export const getLatestReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({
    user: req.user._id,
    isRead: false,
  }).sort({ createdAt: -1 });

  if (report) {
    res.json(report);
  } else {
    res.json({ message: 'No new reports' });
  }
});

// Report ko 'read' mark karne ke liye
export const markReportAsRead = asyncHandler(async (req, res) => {
  const report = await Report.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true } // Updated document return karega
  );

  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  res.json(report);
});