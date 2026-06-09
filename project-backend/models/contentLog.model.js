import mongoose from 'mongoose';

const ContentLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['video', 'song', 'joke', 'movie', 'news','podcast','reel', 'book', 'task'], 
    },
    title: {
      type: String,
      required: true,
    },
    contentId: {
      type: String, // e.g., YouTube video ID, Spotify track ID
      required: true,
    },
    source: {
      type: String, // e.g., 'youtube', 'spotify'
    },
  },
  { timestamps: true }
);

const ContentLog = mongoose.model('ContentLog', ContentLogSchema);
export default ContentLog;