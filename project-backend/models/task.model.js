import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  moodTags: {
    type: [String],
    required: true,
    enum: ['happy', 'sad', 'angry', 'stressed', 'bored', 'calm','neutral','anxious'],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
export default Task;