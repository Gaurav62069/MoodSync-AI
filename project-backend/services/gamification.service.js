import User from '../models/user.model.js';
import Badge from '../models/badge.model.js';

const isConsecutiveDay = (lastDate, today) => {
  if (!lastDate) return false;

  const last = new Date(lastDate);
  const now = new Date(today);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  return last.getDate() === yesterday.getDate() &&
         last.getMonth() === yesterday.getMonth() &&
         last.getFullYear() === yesterday.getFullYear();
};

const isSameDay = (lastDate, today) => {
  if (!lastDate) return false;

  const last = new Date(lastDate);
  const now = new Date(today);

  return last.getDate() === now.getDate() &&
         last.getMonth() === now.getMonth() &&
         last.getFullYear() === now.getFullYear();
};

export const updateMoodStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();

    if (isSameDay(user.lastMoodLogDate, today)) {
      return;
    }

    let pointsToAdd = 10;
    let currentStreak = user.moodLogStreak || 0;

    if (isConsecutiveDay(user.lastMoodLogDate, today)) {
      currentStreak += 1;
      pointsToAdd += 15;
    } else {
      currentStreak = 1;
    }

    user.points += pointsToAdd;
    user.moodLogStreak = currentStreak;
    user.lastMoodLogDate = today;

    await checkAndAwardBadges(user, 'mood');

    await user.save();

  } catch (error) {
    console.error(`Gamification error for user ${userId}:`, error);
  }
};

export const checkAndAwardBadges = async (user, type) => {
  const allBadges = await Badge.find({});
  let newBadges = [];

  for (const badge of allBadges) {
    if (user.badges.includes(badge.badgeId)) continue;

    let eligible = false;

    if (badge.type === 'streak' && type === 'mood') {
      if (user.moodLogStreak >= badge.value) eligible = true;
    }
    if (badge.type === 'points') {
      if (user.points >= badge.value) eligible = true;
    }

    if (eligible) {
      user.badges.push(badge.badgeId);
      newBadges.push(badge.name);
    }
  }

  return newBadges;
};