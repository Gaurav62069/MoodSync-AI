import express from 'express';
import {
  analyzeText,
  analyzeFace,
  analyzeVoice,
  handleChat,
  handleChatEnd
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadFile } from '../middleware/fileUpload.middleware.js';

const router = express.Router();

router.post('/analyze-text', protect, analyzeText);
router.post('/analyze-face', protect, analyzeFace);
router.post('/analyze-voice',  uploadFile.single('audio'), protect,analyzeVoice);
router.post('/chat', protect, handleChat);
router.post('/chat/end', protect, handleChatEnd);

export default router;