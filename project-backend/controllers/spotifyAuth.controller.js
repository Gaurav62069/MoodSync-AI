// controllers/spotifyAuth.controller.js
import axios from "axios";
import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
// 👇 Ensure this import works now that we exported it
import { refreshUserSpotifyToken } from "../services/spotify.service.js";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.FRONTEND_URL}/spotify-callback`;

// @desc    Get Spotify Auth URL
export const getSpotifyAuthUrl = (req, res) => {
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-library-read",
  ];

  const params = new URLSearchParams({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes.join(" "),
    redirect_uri: REDIRECT_URI,
  });

  // ✅ REAL URL
  const url = `https://accounts.spotify.com/authorize?${params.toString()}`;
  res.json({ url });
};

// @desc    Connect Spotify Account
export const connectSpotifyAccount = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id;

  if (!code) {
    res.status(400);
    throw new Error("No authorization code provided");
  }

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    // ✅ REAL URL
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
            ).toString("base64"),
        },
      },
    );

    const { access_token, refresh_token, expires_in } = response.data;

    const user = await User.findById(userId);
    if (user) {
      user.spotifyConnected = true;
      user.spotifyAccessToken = access_token;
      user.spotifyRefreshToken = refresh_token;
      user.spotifyTokenExpiresAt = Date.now() + expires_in * 1000 - 60000;

      await user.save();

      res.status(200).json({
        success: true,
        message: "Spotify Connected Successfully! 🎵",
        user: { spotifyConnected: true },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(
      "🔴 Spotify Connection Error:",
      error.response?.data || error.message,
    );
    res.status(error.response?.status || 500);
    throw new Error("Failed to connect Spotify account");
  }
});

// 👇 NEW FUNCTION (Jo 500 Error de raha tha kyunki ye missing/broken tha)
// @desc    Get Fresh Spotify Access Token
export const getSpotifyAccessToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || !user.spotifyConnected) {
    res.status(400);
    throw new Error("Spotify not connected");
  }

  // Check if valid (5 min buffer)
  if (
    user.spotifyAccessToken &&
    user.spotifyTokenExpiresAt > Date.now() + 300000
  ) {
    return res.json({ token: user.spotifyAccessToken, isUserToken: true });
  }

  // Refresh Token
  const newToken = await refreshUserSpotifyToken(user);

  if (newToken) {
    res.json({ token: newToken, isUserToken: true });
  } else {
    res.status(401);
    throw new Error("Failed to refresh Spotify token. Please reconnect.");
  }
});
