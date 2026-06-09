import express from 'express';
import { protect } from '../middleware/auth.middleware.js'; // Agar login required h
import { liveSearch } from '../controllers/search.controller.js'; // Controller import karein

const router = express.Router();

// Route: /api/content/live-search
router.get('/live-search', protect, liveSearch);

export default router;