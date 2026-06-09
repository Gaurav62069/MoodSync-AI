import axios from "axios";
import User from "../models/user.model.js";
import { getUserPattern } from "../utils/patternMining.util.js"; // 👈 Make sure this file exists

let spotifyAccessToken = null;
let tokenExpiresAt = null;

// --- REGIONAL & LANGUAGE MAPPING ---
const REGIONAL_TAGS = {
  IN: ["Bollywood", "Indian Pop", "Punjabi Pop", "Tollywood", "Kollywood"],
  US: ["Pop", "Hip Hop", "Country", "R&B"],
  GB: ["UK Drill", "Britpop", "Rock"],
  DEFAULT: ["Pop", "Top Hits", "Trending"],
};

// --- 1. App Level Token (Generic) ---
export const getSpotifyToken = async () => {
  if (spotifyAccessToken && tokenExpiresAt > Date.now()) {
    return spotifyAccessToken;
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Spotify credentials missing in .env");
    }

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        },
      },
    );

    spotifyAccessToken = response.data.access_token;
    tokenExpiresAt = Date.now() + (response.data.expires_in * 1000 - 60000);
    return spotifyAccessToken;
  } catch (error) {
    console.error(
      "🔴 SPOTIFY APP TOKEN ERROR:",
      error.response?.data || error.message,
    );
    throw new Error("Spotify authentication failed");
  }
};

// --- 2. User Level Token Refresh ---
export const refreshUserSpotifyToken = async (user) => {
  try {
    console.log("🔄 Refreshing User Spotify Token...");
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: user.spotifyRefreshToken,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { access_token, expires_in, refresh_token } = response.data;
    user.spotifyAccessToken = access_token;
    user.spotifyTokenExpiresAt = Date.now() + expires_in * 1000;
    if (refresh_token) user.spotifyRefreshToken = refresh_token;
    await user.save();
    return access_token;
  } catch (error) {
    console.error(
      "🔴 Failed to refresh user token:",
      error.response?.data || error.message,
    );
    return null;
  }
};

// --- 3. Helper: Choose Best Token ---
const getBestToken = async (userId) => {
  if (userId) {
    const user = await User.findById(userId);
    if (user?.spotifyConnected && user?.spotifyRefreshToken) {
      if (user.spotifyTokenExpiresAt > Date.now()) {
        return { token: user.spotifyAccessToken, isUser: true };
      }
      const refreshedToken = await refreshUserSpotifyToken(user);
      if (refreshedToken) return { token: refreshedToken, isUser: true };
    }
  }
  const appToken = await getSpotifyToken();
  return { token: appToken, isUser: false };
};

// --- 4. FETCH SONGS (Smart AI Logic) ---
export const fetchSong = async (mood, country = "IN", userId, preferences) => {
  const { token, isUser } = await getBestToken(userId);

  // --- A. GATHER INTELLIGENCE ---

  // 1. Language Preference (e.g., "Hindi Punjabi")
  let langQuery = "";
  if (preferences?.languages?.length > 0) {
    // Pick top 2 languages randomly to keep variety
    const shuffled = preferences.languages.sort(() => 0.5 - Math.random());
    langQuery = shuffled.slice(0, 2).join(" ");
  }

  // 2. Data Mining: Implicit Pattern (History Analysis)
  // Check karega ki user pichle kuch dino me kya "Keywords" search kar raha h
  const userPattern = await getUserPattern(userId, "song"); // e.g., "lofi remix"

  // 3. Explicit Preference: Favorite Artist
  let preferredArtist = "";
  if (preferences?.favoriteArtists?.length > 0) {
    preferredArtist =
      preferences.favoriteArtists[
        Math.floor(Math.random() * preferences.favoriteArtists.length)
      ];
  }

  // 4. Regional Flavor (Fallback)
  const regionalTags = REGIONAL_TAGS[country] || REGIONAL_TAGS["DEFAULT"];
  const regionalFlavor =
    regionalTags[Math.floor(Math.random() * regionalTags.length)];

  // --- B. CONSTRUCT SMART QUERY ---
  // Priority: User Pattern > Favorite Artist > Regional Flavor

  let query = `${mood} ${langQuery}`;

  if (userPattern) {
    // Agar mining data available hai, to use Priority do
    query += ` ${userPattern}`;
  } else if (preferredArtist && Math.random() > 0.3) {
    // 70% chance to show Favorite Artist if no pattern
    query += ` ${preferredArtist}`;
  } else {
    // Fallback to Regional Trends
    query += ` ${regionalFlavor}`;
  }

  // Generic fallback if query is too short
  if (query.length < 10) query += " song";

  console.log(`🧠 [Music AI] Query: "${query}" | Market: ${country}`);

  try {
    const { data } = await axios.get(`https://api.spotify.com/v1/search`, {
      params: {
        q: query,
        type: "track",
        market: country,
        limit: 10,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.tracks?.items?.length) return [];

    return data.tracks.items.map((track) => ({
      type: "song",
      source: "Spotify",
      title: track.name,
      content: track.artists.map((a) => a.name).join(", "),
      contentId: track.id,
      uri: track.uri,
      image_url: track.album.images?.[0]?.url,
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      isUserAccount: isUser,
    }));
  } catch (error) {
    console.error(
      "🟡 Song Fetch Error:",
      error.response?.data || error.message,
    );
    return [];
  }
};

// --- 5. FETCH PODCASTS (Smart AI Logic) ---
export const fetchPodcast = async (
  mood,
  country = "IN",
  userId,
  preferences,
) => {
  const { token, isUser } = await getBestToken(userId);

  // --- A. GATHER INTELLIGENCE ---

  // 1. Language (Important for Podcasts)
  let langQuery = "";
  if (preferences?.languages?.length > 0) {
    langQuery = preferences.languages[0]; // Primary language
  } else if (country === "IN") {
    langQuery = "Hindi"; // Default for India
  }

  // 2. Data Mining: Pattern
  const userPattern = await getUserPattern(userId, "podcast"); // e.g., "motivation finance"

  // 3. Explicit Preference: Creator
  let preferredCreator = "";
  if (preferences?.favoriteCreators?.length > 0) {
    preferredCreator =
      preferences.favoriteCreators[
        Math.floor(Math.random() * preferences.favoriteCreators.length)
      ];
  }

  // --- B. CONSTRUCT QUERY ---
  let query = `${mood} ${langQuery}`;

  if (userPattern) {
    query += ` ${userPattern}`;
  } else if (preferredCreator && Math.random() > 0.4) {
    query += ` ${preferredCreator}`;
  } else {
    query += " podcast";
  }

  console.log(`🧠 [Podcast AI] Query: "${query}"`);

  try {
    const { data } = await axios.get(`https://api.spotify.com/v1/search`, {
      params: {
        q: query,
        type: "show",
        market: country,
        limit: 10,
      },
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.shows?.items?.length) return [];

    return data.shows.items.map((pod) => ({
      type: "podcast",
      source: "Spotify",
      title: pod.name,
      description: pod.description,
      contentId: pod.id,
      uri: pod.uri,
      image_url: pod.images?.[0]?.url,
      publisher: pod.publisher,
      isUserAccount: isUser,
    }));
  } catch (error) {
    console.error(
      "🟡 Podcast Fetch Error:",
      error.response?.data || error.message,
    );
    return [];
  }
};
