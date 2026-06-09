import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    summaryContent: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    
    data: {
      moods: Object,
      content: Object,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', ReportSchema);
export default Report;