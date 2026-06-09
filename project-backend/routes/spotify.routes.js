// project-backend/routes/spotify.routes.js
import express from 'express';
import { protect } from '../middleware/auth.middleware.js'; // Auth middleware zaroori hai
import { getSpotifyAuthUrl, connectSpotifyAccount,getSpotifyAccessToken } from '../controllers/spotifyAuth.controller.js';

const router = express.Router();

// Step 1: Frontend ye hit karega URL lene ke liye
router.get('/auth-url', protect, getSpotifyAuthUrl); 

// Step 2: Frontend "code" bhejega connect karne ke liye
router.post('/connect', protect, connectSpotifyAccount);
router.get('/token', protect, getSpotifyAccessToken);
export default router;