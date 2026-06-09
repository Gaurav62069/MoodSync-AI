import express from 'express';
import {
  getJokeSuggestion,
  getMovieSuggestion,
  getSongSuggestion,
  getNewsSuggestion,  
  getVideoSuggestion, 
  getTaskSuggestion,
  getBookSuggestion, 
  getPodcastSuggestion, 
  getShortsSuggestion,
} from '../controllers/suggestion.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/joke', protect, getJokeSuggestion);
router.get('/movie', protect, getMovieSuggestion);
router.get('/song', protect, getSongSuggestion);
router.get('/news', protect, getNewsSuggestion); 
router.get('/reel', protect, getShortsSuggestion);  
router.get('/video', protect, getVideoSuggestion); 
router.get('/task', protect, getTaskSuggestion);
router.get('/book', protect, getBookSuggestion); 
router.get('/podcast', protect, getPodcastSuggestion); 
export default router;