import MoodLog from '../models/moodLog.model.js';
import User from '../models/user.model.js';
import { updateMoodStreak } from './gamification.service.js';

/**
 * Service: Create Mood Log & Handle Gamification
 */
export const createMoodLogService = async (userId, moodData) => {
  // 1. Mood Entry Create karo
  const docToCreate = { ...moodData, user: userId };
  const moodLog = await MoodLog.create(docToCreate);

  // 2. Gamification Logic (Streak Update)
  // Hum wait kar rahe hain taaki user ko updated points milein
  try {
    await updateMoodStreak(userId);
  } catch (error) {
    console.error("Gamification update failed:", error.message);
    // Gamification fail hone par bhi mood log save rehna chahiye
  }

  // 3. User ke latest points/badges fetch karo
  const updatedUser = await User.findById(userId).select('points badges moodLogStreak');

  // 4. Combined Data return karo
  return {
    moodLog,
    gamification: {
      points: updatedUser?.points || 0,
      streak: updatedUser?.moodLogStreak || 0,
      badges: updatedUser?.badges || []
    }
  };
};

/**
 * Service: Fetch Mood History
 */
export const getMoodHistoryService = async (userId, query) => {
  // Example for Limit: ?limit=10
  const limit = parseInt(query.limit) || 0;
  
  const moodQuery = MoodLog.find({ user: userId }).sort('-createdAt');
  
  if (limit > 0) {
    moodQuery.limit(limit);
  }

  return await moodQuery;
};