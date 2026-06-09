import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type: Song, Video, Podcast, etc.
  type: {
    type: String, 
    required: true,
    enum: ['song', 'video', 'podcast', 'movie', 'news', 'joke', 'short'] 
  },
  // Title: Song ka naam ya Video ka title
  title: {
    type: String,
    required: true
  },
  // Content ID: Spotify ID ya YouTube ID
  contentId: {
    type: String,
    required: true
  },
  // Mood: Kis mood me ye content dekha gya
  mood: {
    type: String,
    required: true
  },
  // Metadata: Data Mining ke liye extra info (Artists, Channel Name)
  metadata: {
    artist: String,    // e.g. "Arijit Singh"
    channel: String,   // e.g. "CarryMinati"
    genre: String,     // e.g. "Rock"
    language: String   // e.g. "Hindi"
  },
  source: {
    type: String,
    default: 'System'
  }
}, { timestamps: true });

// Indexing for faster mining queries
logSchema.index({ user: 1, type: 1, createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;