import asyncHandler from 'express-async-handler';
import ActivityLog from '../models/activityLog.model.js';
import { processContext } from '../services/context.service.js';

/**
 * @desc    Logs a new activity (Supports Web & Mobile sources)
 * @route   POST /api/activity
 * @access  Private
 */
export const logActivity = asyncHandler(async (req, res) => {
  // 1. 'source' field receive karo (Default: 'web')
  const { type, data, source = 'web' } = req.body;
  const userId = req.user._id;

  if (!type || !data) {
    res.status(400);
    throw new Error('Activity type and data are required');
  }

  // 2. Nayi activity ko DB mein save karo
  const newLog = await ActivityLog.create({
    user: userId,
    type: type,
    data: data,
    source: source // Ab hum source bhi save kar rahe hain
  });

  // 3. "Context Engine" Logic (Conditional)
  // Context Engine tabhi chalana chahiye jab data Mobile App (Sensors) se aaye.
  // Web par background sensors nahi hote, isliye wahan isse skip karein.
  if (source !== 'web') {
      try {
          processContext(userId, newLog);
      } catch (error) {
          console.error("Context processing failed:", error.message);
          // Main flow mat roko agar background job fail ho jaye
      }
  }

  // 4. Response bhej do
  res.status(201).json({ 
    success: true, 
    message: 'Activity logged',
    logId: newLog._id 
  });
});

/**
 * @desc    Get stats for charts (e.g. Pie Chart in Dashboard)
 * @route   GET /api/activity/stats
 * @access  Private
 */
export const getActivityStats = asyncHandler(async (req, res) => {
  const stats = await ActivityLog.aggregate([
    { $match: { user: req.user._id } }, // Sirf current user ka data
    { $group: { _id: '$type', count: { $sum: 1 } } } // Type ke basis pe count karo
  ]);

  // Frontend ke liye format karo (e.g., { name: 'Songs', value: 10 })
  const formattedStats = stats.map(item => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1), // Capitalize (e.g. 'Songs')
    value: item.count
  }));

  res.json(formattedStats);
});