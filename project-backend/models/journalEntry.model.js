import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled Entry',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    moodLog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MoodLog',
      default: null,
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);
export default JournalEntry;