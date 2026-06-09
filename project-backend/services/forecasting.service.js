import User from '../models/user.model.js';
import MoodLog from '../models/moodLog.model.js';
import SleepLog from '../models/sleepLog.model.js';
import axios from 'axios';

const pythonServerUrl = 'http://localhost:5001/forecast-mood';

export const generateForecastForUser = async (user) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const moodData = await MoodLog.find({
      user: user._id,
      createdAt: { $gte: sevenDaysAgo },
    }).select('mood createdAt');
    
    const sleepData = await SleepLog.find({
      user: user._id,
      createdAt: { $gte: sevenDaysAgo },
    }).select('quality duration createdAt');

    if (moodData.length < 3) {
      // Agar data bahut kam hai toh predict nahi karenge
      console.log(`Skipping forecast for ${user.username}: Insufficient data.`);
      return;
    }

    const historicalData = { moods: moodData, sleep: sleepData };

    const { data } = await axios.post(pythonServerUrl, {
      historicalData: historicalData,
    });

    if (!data.success) {
      throw new Error('Python forecast failed');
    }

    user.lastForecast = {
      mood: data.predictedMood,
      confidence: data.confidence,
      date: new Date(),
    };
    await user.save();
    
    console.log(`Forecast generated for ${user.username}: ${data.predictedMood}`);
    
    

  } catch (error) {
    console.error(`Forecast error for ${user.username}:`, error.message);
  }
};

export const generateForecastsForAllUsers = async () => {
  console.log('--- Running Daily Mood Forecast Generation ---');
  const users = await User.find({ emailVerified: true });
  for (const user of users) {
    await generateForecastForUser(user);
  }
  console.log('--- Daily Mood Forecast Generation Complete ---');
};