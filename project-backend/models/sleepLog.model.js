import mongoose from 'mongoose';

const SleepLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sleepStartTime: {
      type: Date,
      required: true,
    },
    sleepEndTime: {
      type: Date,
      required: true,
    },
    duration: { // Hours
      type: Number,
      required: true,
    },
    
    // --- UPDATED FIELDS FOR FLEXIBILITY ---
    
    // 1. Quality (Changed from Enum String to Number Score)
    // Web ke liye default 0 rahega ("Not Analyzed")
    // Mobile AI se 0-100 ka score milega
    quality: {
      type: Number,
      default: 0, 
      min: 0,
      max: 100
    },

    interruptions: {
      type: Number,
      default: 0,
    },

    // 2. Source Identification (Web vs Mobile vs Watch)
    source: {
      type: String,
      enum: ['web', 'mobile', 'device', 'manual'], 
      default: 'web'
    },

    // 3. Notes for details (e.g., "AI Analysis Failed" or "Manual Entry")
    notes: {
      type: String, 
      default: ''
    }
  },
  { timestamps: true }
);

const SleepLog = mongoose.model('SleepLog', SleepLogSchema);
export default SleepLog;