// video.service.js - YouTube Video & Shorts Fetching with Smart Query Building (AI-Powered) 🎥🤖
import axios from "axios";
import { getUserPattern } from "../utils/patternMining.util.js"; // 👈 Pattern Mining Import

// --- HELPER: Smart Query Builder (The Brain) 🧠 ---
const buildSmartQuery = async (mood, userId, preferences, type = "video") => {
  let query = `${mood}`;

  // 1. Language Bias (India First 🇮🇳)
  let lang = "";
  if (preferences?.languages?.length > 0) {
    // User ki languages me se ek random pick karo (Variety ke liye)
    lang =
      preferences.languages[
        Math.floor(Math.random() * preferences.languages.length)
      ];
  } else {
    lang = "Hindi"; // Default fallback for India
  }

  // 2. Data Mining (Pattern)
  // Check karega ki user YouTube par kya search kar raha h (e.g., "coding", "gaming")
  const userPattern = await getUserPattern(userId, "video");

  // 3. Explicit Preference (Creator)
  let preferredCreator = "";
  if (preferences?.favoriteCreators?.length > 0) {
    preferredCreator =
      preferences.favoriteCreators[
        Math.floor(Math.random() * preferences.favoriteCreators.length)
      ];
  }

  // --- QUERY CONSTRUCTION ---
  // Formula: {Mood} + {Language} + ({Pattern} OR {Creator})

  query += ` ${lang}`; // e.g. "Happy Hindi"

  // AI Decision: Pattern ko priority do, kabhi-kabhi Creator dikhao
  if (userPattern) {
    query += ` ${userPattern}`; // "Happy Hindi Gaming"
  } else if (preferredCreator && Math.random() > 0.3) {
    // 70% chance to show Creator content if no strong pattern
    query += ` ${preferredCreator}`; // "Happy Hindi CarryMinati"
  } else {
    // Fallback: Add generic terms
    query += type === "short" ? " #shorts" : " video";
  }

  return query;
};

// --- 1. FETCH VIDEOS (Long Form) ---
export const fetchVideo = async (mood, country, userId, preferences) => {
  try {
    const query = await buildSmartQuery(
      mood,
      userId,
      preferences,
      "video",
    );
    console.log(`📹 [YouTube Video AI] Query: "${query}"`);

    const { data } = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          videoEmbeddable: "true",
          videoDuration: "medium", // 4-20 mins (Shorts avoid karne ke liye)
          maxResults: 12,
          key: process.env.YOUTUBE_API_KEY,
          regionCode: "IN", // Force India Region
        },
      },
    );
    const videoIds = data.items.map((item) => item.id.videoId).join(",");

    const detailsRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "status",
          id: videoIds,
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    const embeddableVideoIds = new Set(
      detailsRes.data.items
        .filter((v) => v.status.embeddable === true)
        .map((v) => v.id),
    );

    if (!data.items) return [];

    return data.items
      .filter((item) => embeddableVideoIds.has(item.id.videoId)) // ✅ FILTER
      .map((item) => ({
        type: "video",
        source: "YouTube",
        title: item.snippet.title,
        content: item.snippet.channelTitle,
        contentId: item.id.videoId,
        image_url: item.snippet.thumbnails.high.url,
        description: item.snippet.description,
      }));
  } catch (error) {
    console.error("YouTube Video Error:", error.message);
    return [];
  }
};

// --- 2. FETCH SHORTS (Vertical Videos) ---
// Note: YouTube API me "Shorts" ka direct filter nahi h,
// par hum "#shorts" keyword aur "short" duration se filter karte hain.
export const fetchShorts = async (mood, country, userId, preferences) => {
  try {
    let query = await buildSmartQuery(mood, userId, preferences, "short");
    query += " #shorts"; // Force Shorts results

    console.log(`📱 [YouTube Shorts AI] Query: "${query}"`);

    const { data } = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          videoDuration: "short", // < 4 mins ensures shorts mostly
          maxResults: 12,
          key: process.env.YOUTUBE_API_KEY,
          regionCode: country || "IN",
        },
      },
    );

    if (!data.items) return [];

    return data.items.map((item) => ({
      type: "reel", // Frontend me tab ka naam 'reel' h
      isShort: true,
      source: "YouTube Shorts",
      title: item.snippet.title,
      content: item.snippet.channelTitle,
      contentId: item.id.videoId,
      image_url: item.snippet.thumbnails.high.url, // Shorts usually use high res vertical thumb
    }));
  } catch (error) {
    console.error("YouTube Shorts Error:", error.message);
    return [];
  }
};
