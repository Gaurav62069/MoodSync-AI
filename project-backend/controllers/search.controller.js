import asyncHandler from 'express-async-handler';
import axios from 'axios';
// 👇 Ensure kiya gaya hai ki ye function spotify.service.js se exported ho
import { getSpotifyToken } from '../services/spotify.service.js';

// @desc    Live Search for Artists and Creators (Auto-complete)
// @route   GET /api/content/live-search?query=...&type=...
// @access  Private
export const liveSearch = asyncHandler(async (req, res) => {
    const { query, type } = req.query; 

    // Agar query 2 letters se choti h, to search mat karo (API bachaao)
    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        let results = [];

        // --- CASE 1: SPOTIFY ARTIST SEARCH ---
        if (type === 'artist') {
            // Service se token mangwaao
            const token = await getSpotifyToken();
            
            // Spotify Search API Call
            // Note: Hum wahi proxy URL use kar rahe hain jo service me kiya tha
            const { data } = await axios.get(`https://api.spotify.com/v1/search`, {
                params: { 
                    q: query, 
                    type: 'artist', 
                    limit: 5 // Sirf top 5 results dikhaayenge dropdown me
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.artists) {
                results = data.artists.items.map(a => ({
                    name: a.name,
                    // Agar image h to lo, nahi to null
                    image: a.images?.[0]?.url || null,
                    sub: 'Artist'
                }));
            }
        }

        // --- CASE 2: YOUTUBE CREATOR SEARCH ---
        else if (type === 'creator') {
            const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'channel', // 👈 Sirf Channels dhundho (Videos nahi)
                    maxResults: 5,
                    key: process.env.YOUTUBE_API_KEY
                }
            });
            
            if (data.items) {
                results = data.items.map(c => ({
                    name: c.snippet.channelTitle,
                    image: c.snippet.thumbnails?.default?.url || null,
                    sub: 'YouTuber'
                }));
            }
        }

        // --- RESPONSE ---
        res.json(results);

    } catch (error) {
        // Search fail hone par app crash nahi hona chahiye, bas empty list bhej do
        console.error("Live Search Error:", error.response?.data || error.message);
        res.json([]); 
    }
});