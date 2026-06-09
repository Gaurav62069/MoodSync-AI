import mongoose from 'mongoose';

const MoodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mood: {
      type: String,
      required: [true, 'Mood is required'],
      enum: ['happy', 'sad', 'angry', 'stressed', 'bored', 'calm', 'neutral', 'excited', 'anxious','fear'],
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      enum: ['text', 'face', 'voice', 'chat'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const MoodLog = mongoose.model('MoodLog', MoodLogSchema);
export default MoodLog;