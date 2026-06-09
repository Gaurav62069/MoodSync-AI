import express from 'express';
// 👇 restrictTo ko import kiya
import { protect, restrictTo } from '../middleware/auth.middleware.js';

import { 
  createTask, 
  getTasks, 
  deleteTask 
} from '../controllers/task.controller.js';

import { 
  getAllUsers, 
  updateUserRole, 
  toggleBlockUser 
} from '../controllers/admin.controller.js';

const router = express.Router();

// ==========================================
// SECURITY BLOCK
// ==========================================
// Niche ke saare routes ke liye Login zaroori hai
router.use(protect);
// Admin aur Owner dono allowed hain (Owner supremacy!)
router.use(restrictTo('admin', 'owner'));


// ==========================================
// 1. TASK ROUTES
// ==========================================
router.route('/tasks')
  .post(createTask)
  .get(getTasks);

router.route('/tasks/:id')
  .delete(deleteTask);

// ==========================================
// 2. USER MANAGEMENT ROUTES
// ==========================================
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleBlockUser);

export default router;