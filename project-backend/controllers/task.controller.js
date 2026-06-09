import asyncHandler from 'express-async-handler';
import Task from '../models/task.model.js';

// @desc    Get all tasks (Used by Admin Dashboard)
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req, res) => {
  // Sabhi tasks laao, latest pehle
  const tasks = await Task.find({}).sort({ createdAt: -1 });
  res.json(tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
export const createTask = asyncHandler(async (req, res) => {
  const { title, mood, type, difficulty } = req.body;

  // Validation: Title aur Mood zaroori hai
  if (!title || !mood) {
    res.status(400);
    throw new Error('Please add a title and mood');
  }

  // Naya task banao
  const task = await Task.create({
    title,
    mood,
    type: type || 'mental',        // Default to mental if missing
    difficulty: difficulty || 'easy' // Default to easy if missing
  });

  res.status(201).json(task);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task) {
    await task.deleteOne(); // Task delete karo
    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});