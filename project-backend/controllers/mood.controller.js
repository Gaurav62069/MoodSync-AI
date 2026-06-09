import asyncHandler from 'express-async-handler';
import { 
  createMoodLogService, 
  getMoodHistoryService 
} from '../services/mood.service.js';

/**
 * @desc    Log a new mood entry & update gamification
 * @route   POST /api/mood
 * @access  Private
 */
export const logMood = asyncHandler(async (req, res) => {
  // 1. Service ko data pass karo (User ID + Body)
  const result = await createMoodLogService(req.user._id, req.body);

  // 2. Response bhejo
  res.status(201).json({
    success: true,
    data: result.moodLog,
    gamification: result.gamification
  });
});

/**
 * @desc    Get mood history (With Filters)
 * @route   GET /api/mood
 * @access  Private
 */
export const getMoodHistory = asyncHandler(async (req, res) => {
  // 1. Service se data mango (Query params pass kiye filtering ke liye)
  const history = await getMoodHistoryService(req.user._id, req.query);

  // 2. Response bhejo
  res.status(200).json({
    success: true,
    count: history.length,
    moodHistory: history
  });
});