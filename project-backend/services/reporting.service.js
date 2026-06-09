import { GoogleGenerativeAI } from '@google/generative-ai';
import User from '../models/user.model.js';
import MoodLog from '../models/moodLog.model.js';
import ContentLog from '../models/contentLog.model.js';
import Report from '../models/report.model.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

const aggregateData = (logs) => {
  return logs.reduce((acc, log) => {
    const key = log.mood || log.type;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
};

export const generateWeeklyReportForUser = async (user) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const moodLogs = await MoodLog.find({
      user: user._id,
      createdAt: { $gte: sevenDaysAgo },
    });
    const contentLogs = await ContentLog.find({
      user: user._id,
      createdAt: { $gte: sevenDaysAgo },
    });

    if (moodLogs.length === 0 && contentLogs.length === 0) {
      console.log(`No data for user ${user.username}. Skipping report.`);
      return;
    }

    const moodData = aggregateData(moodLogs);
    const contentData = aggregateData(contentLogs);

    const prompt = `
      You are a friendly wellness assistant. A user named ${user.username} has the following activity for the last 7 days:
      - Moods logged: ${JSON.stringify(moodData)}
      - Content viewed: ${JSON.stringify(contentData)}

      Write a short (2-3 sentences), kind, and insightful summary for ${user.username}. 
      Give one positive observation and one gentle suggestion.
      Do not sound like a robot. Be warm and encouraging.
    `;

    const result = await aiModel.generateContent(prompt);
    const summary = await result.response.text();

    await Report.create({
      user: user._id,
      weekStartDate: sevenDaysAgo,
      summaryContent: summary,
      data: {
        moods: moodData,
        content: contentData,
      },
    });

    console.log(`Successfully generated report for ${user.username}`);
  } catch (error) {
    console.error(`Failed to generate report for ${user.username}:`, error);
  }
};

export const generateReportsForAllUsers = async () => {
  console.log('--- Running Weekly Report Generation ---');
  const users = await User.find({ emailVerified: true });
  for (const user of users) {
    await generateWeeklyReportForUser(user);
  }
  console.log('--- Weekly Report Generation Complete ---');
};