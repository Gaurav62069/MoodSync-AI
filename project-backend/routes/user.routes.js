import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  registerPushToken
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadFile } from '../middleware/fileUpload.middleware.js';

const router = express.Router();
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .patch(protect, uploadFile.single('profilePicture'),updateUserProfile)
  .delete(protect, deleteUserProfile);
router.post('/register-push', protect, registerPushToken);
export default router;