import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { admin } from '../middleware/admin.middleware.js'; // 👈 Import Admin Middleware
import { createTask, getTasks, deleteTask } from '../controllers/task.controller.js'; // Ensure functions match your controller

const router = express.Router();

// Public Route (For Users to see tasks)
router.get('/', protect, getTasks); 

// Admin Routes (Create & Delete) - Sirf Admin ke liye
router.post('/', protect, admin, createTask);
router.delete('/:id', protect, admin, deleteTask);

export default router;