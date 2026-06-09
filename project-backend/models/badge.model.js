import mongoose from 'mongoose';

const BadgeSchema = new mongoose.Schema({
  badgeId: { // e.g., 'streak-5'
    type: String,
    required: true,
    unique: true,
  },
  name: { // e.g., "5-Day Streak"
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // 'badge-icon-streak-5.png'
  },
  type: { // Badge kis cheez par milega
    type: String,
    enum: ['streak', 'points', 'journal_count','mood_count'],
    required: true,
  },
  value: { // Kitni value par milega
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Badge = mongoose.model('Badge', BadgeSchema);
export default Badge;