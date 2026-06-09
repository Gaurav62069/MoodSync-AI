//suggestion.controller.js
import asyncHandler from "express-async-handler";
import { getFromCache, saveToCache } from "../services/cache.service.js";
import ContentLog from "../models/contentLog.model.js"; // 👈 New Import

// --- Import Services ---
import { fetchJoke } from "../services/joke.service.js";
import { fetchMovies } from "../services/movie.service.js";
import { fetchSong, fetchPodcast } from "../services/spotify.service.js";
import { fetchNews } from "../services/news.service.js";
import { fetchVideo, fetchShorts } from "../services/video.service.js";
import { fetchTask } from "../services/task.service.js";
import { fetchBook } from "../services/book.service.js";

// --- Caching Wrapper Function ---
// Checks: Cache? -> API? -> Filter History -> Return
const getSuggestionWithCache = (serviceFunction, type) =>
  asyncHandler(async (req, res) => {
    const { mood } = req.query;
    const userId = req.user?._id;
    const country = req.user?.country || "IN";

    if (!mood) {
      res.status(400);
      throw new Error("Mood query parameter is required");
    }

    // --- 1. PERSONALIZATION CHECK ---
    // If the user is connected to Spotify and requesting songs,
    // we bypass the cache to get fresh, personalized recommendations from their Spotify account.
    let bypassCache = false;
    if (type === "song" && req.user?.spotifyConnected) {
      bypassCache = true;
    }

    // Unique Cache Key (e.g., "movie_happy_IN")
    const cacheKey = `${type}_${mood}_${country}`;

    let rawData = null;
    let source = "api";

    // --- 2. TRY CACHE (If not bypassing) ---
    if (!bypassCache) {
      rawData = getFromCache(cacheKey);
      if (rawData) {
        source = "cache";
      }
    }

    // --- 3. CALL API SERVICE (If cache missed or bypassed) ---
    if (!rawData) {
      try {
        console.log(
          `🌐 Fetching ${type} from API (User: ${req.user?.username || "Guest"})...`,
        );

        // We pass req.user preferences (if any) to the service function
        // Note: Ensure your service functions (fetchMovie, etc.) are updated to accept/use these preferences if needed.
        rawData = await serviceFunction(
          mood,
          country,
          userId,
          req.user?.preferences,
        );

        // Save to Cache (Only if it's GENERAL data, not personalized)
        if (rawData && rawData.length > 0 && !bypassCache) {
          saveToCache(cacheKey, rawData);
        }
        source = bypassCache ? "personalized-api" : "api";
      } catch (error) {
        console.error(`Error in ${type} service:`, error.message);

        // Fallback: If personalized API fails, try getting generic data from cache
        if (bypassCache) {
          rawData = getFromCache(cacheKey);
          if (rawData) source = "cache-fallback";
        }

        if (!rawData) {
          res.status(500);
          throw new Error(`${type} service failed`);
        }
      }
    }

    // --- 4. HISTORY FILTERING ("Seen It" Filter) ---
    // Remove items the user has already seen/logged.
    let finalData = rawData;

    if (userId && rawData.length > 0) {
      // Fetch the list of content IDs this user has already logged for this type
      const seenContent = await ContentLog.find({
        user: userId,
        type: type,
      }).distinct("contentId");

      // Filter out seen items
      if (seenContent.length > 0) {
        finalData = rawData.filter(
          (item) => !seenContent.includes(item.contentId),
        );
      }

      // If the user has seen everything in the current batch:
      if (finalData.length === 0) {
        console.log(
          `User ${userId} has seen all cached ${type}s for ${mood}. Returning shuffled cache.`,
        );
        // Fallback: Return original data but shuffled, so UI isn't empty.
        finalData = [...rawData].sort(() => Math.random() - 0.5);
      }
    }

    res.json({
      success: true,
      source: source,
      isFiltered: finalData.length < rawData.length,
      data: finalData,
    });
  });

// --- Export Controllers ---
export const getJokeSuggestion = getSuggestionWithCache(fetchJoke, "joke");
export const getMovieSuggestion = getSuggestionWithCache(fetchMovies, "movie");
export const getSongSuggestion = getSuggestionWithCache(fetchSong, "song");
export const getPodcastSuggestion = getSuggestionWithCache(
  fetchPodcast,
  "podcast",
);
export const getNewsSuggestion = getSuggestionWithCache(fetchNews, "news");
export const getShortsSuggestion = getSuggestionWithCache(fetchShorts, "reel");
export const getVideoSuggestion = getSuggestionWithCache(fetchVideo, "video");
export const getTaskSuggestion = getSuggestionWithCache(fetchTask, "task");
export const getBookSuggestion = getSuggestionWithCache(fetchBook, "book");
