import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Badge from './models/badge.model.js'; 

dotenv.config();

const badges = [
  {
    badgeId: "7_day_streak",
    name: "Week Warrior",
    description: "Logged mood for 7 consecutive days",
    type: "streak",
    value: 7,
    icon: "flame"
  },
  {
    badgeId: "30_day_streak",
    name: "Commitment King",
    description: "Logged mood for 30 consecutive days",
    type: "streak",
    value: 30,
    icon: "zap"
  },
  {
    badgeId: "100_points",
    name: "Century Club",
    description: "Earned 100 wellness points",
    type: "points",
    value: 100,
    icon: "star"
  },
  {
    badgeId: "mood_master",
    name: "Mood Master",
    description: "Logged 50 moods in total",
    // 👇 Fixed: 'count' -> 'mood_count'
    type: "mood_count", 
    value: 50,
    icon: "award"
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...');

    await Badge.deleteMany({});
    console.log('🗑️  Old badges cleared.');

    await Badge.insertMany(badges);
    console.log('🎉 All Badges inserted successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedDB();