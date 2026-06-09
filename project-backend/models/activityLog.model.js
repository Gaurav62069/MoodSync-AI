import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      // Updated enum to support both Mobile (e.g., screenUnlock) and Web (e.g., navigation)
      enum: [
        'appUsage', 
        'physicalActivity', 
        'screenUnlock', 
        'location', 
        'calendar', 
        'navigation', // New for Web (Page visits)
        'interaction' // New for Web (Button clicks, likes, etc.)
      ],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    
    // --- NEW FIELD: SOURCE IDENTIFICATION ---
    // Isse humein pata chalega ki data kahan se aaya hai
    source: {
      type: String,
      enum: ['web', 'mobile', 'device'], // 'device' can be smart watch in future
      default: 'web'
    }
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export default ActivityLog;