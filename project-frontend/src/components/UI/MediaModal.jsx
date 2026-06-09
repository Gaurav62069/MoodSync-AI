import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  GripHorizontal,
  Music,
  PlayCircle,
  Mic,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SpotifyPlayer from "react-spotify-web-playback";
import axios from "axios"; // 👈 Import Axios
import { useAuth } from "../../context/AuthContext";
import { spotifyApi } from "../../services/api";

const MediaModal = ({ item, onClose }) => {
  const { user } = useAuth();
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(null); // 👈 New State: Premium check karne ke liye
  const isReel = item?.type === "reel";
  // --- 1. Embed URL Logic (Fallback) ---
  const getEmbedUrl = () => {
    if (!item) return null;
    if (isReel && item.contentId) {
      return `https://www.youtube.com/embed/${item.contentId}?autoplay=1&controls=0&loop=1&playlist=${item.contentId}&modestbranding=1&rel=0&playsinline=1`;
    }
    if (item.type === "video" || item.video_url) {
      // Agar direct video_url function se aaya hai
      if (item.video_url && item.video_url.includes("youtube")) {
        return `${item.video_url}?autoplay=1`;
      }
      return `https://www.youtube.com/embed/${item.contentId}?autoplay=1`;
    }
    // ✅ Use Official Embed URLs
    if (item.type === "song")
      return `https://open.spotify.com/embed/track/${item.contentId}?utm_source=generator`;
    if (item.type === "podcast")
      console.log("PODCAST ITEM:", item);

      return `https://open.spotify.com/embed/show/${item.contentId}?utm_source=generator`;
    return null;
  };

  const embedUrl = getEmbedUrl();

  // --- 2. ⚡ SMART CHECK: Token + Premium Status ---
  useEffect(() => {
    if (item?.type === "song" && user?.spotifyConnected) {
      const checkSpotifyStatus = async () => {
        setLoading(true);
        try {
          const { token, isUserToken } = await spotifyApi.getAccessToken();

          // 🧠 IMPORTANT GUARD
          if (!isUserToken) {
            setIsPremium(false);
            setLoading(false);
            return;
          }

          const { data } = await axios.get("https://api.spotify.com/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (data.product === "premium") {
            setIsPremium(true);
            setAccessToken(token);
          } else {
            setIsPremium(false);
          }
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn("Spotify premium check skipped");
          }
          setIsPremium(false);
        } finally {
          setLoading(false);
        }
      };

      checkSpotifyStatus();
    } else {
      setIsPremium(false);
    }
  }, [item, user?.spotifyConnected]);

  // --- 3. Decide View ---
  // SDK tabhi dikhao jab Song ho + Premium ho + Token available ho
  const showFullPlayer =
    item?.type === "song" && isPremium === true && accessToken;

  if (!item) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={`fixed bottom-6 right-6 rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl transition-all duration-300 align-center
            ${isReel ? "w-[145px]" : "w-80 sm:w-50 md:w-96"} 
        `}
        style={{ zIndex: 9999 }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-3 bg-white/5 border-b border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-gray-300 flex-1 min-w-0">
            <GripHorizontal size={16} className="text-gray-500" />
            <div className="flex items-center gap-2 overflow-hidden">
              {item.type === "song" && (
                <Music size={14} className="text-green-400 shrink-0" />
              )}
              {item.type === "podcast" && (
                <Mic size={14} className="text-blue-400 shrink-0" />
              )}
              {item.type === "video" && (
                <PlayCircle size={14} className="text-red-400 shrink-0" />
              )}
              <span className="text-xs font-semibold truncate text-white/90">
                {item.title}
              </span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* CONTENT AREA */}
        <div className="w-full relative bg-black/40 backdrop-blur-sm">
          {loading ? (
            <div className="h-[70px] flex items-center justify-center">
              <Loader2 className="animate-spin text-green-500" />
            </div>
          ) : showFullPlayer ? (
            // CASE A: FULL PLAYER (Sirf Premium walon ke liye)
            <div className="p-0 min-h-[70px]">
              <SpotifyPlayer
                token={accessToken}
                uris={[item.uri || `spotify:track:${item.contentId}`]}
                styles={{
                  activeColor: "#1DB954",
                  bgColor: "transparent",
                  color: "#fff",
                  loaderColor: "#1DB954",
                  sliderColor: "#1DB954",
                  trackArtistColor: "#9ca3af",
                  trackNameColor: "#fff",
                  height: "70px",
                }}
                play={true}
                callback={(state) => {
                  if (state.error) console.error("SDK Error:", state.error);
                }}
              />
            </div>
          ) : // CASE B: EMBED PLAYER (Free Users / Error / Video)
          embedUrl ? (
            <div
               className={
    isReel
      ? "aspect-[9/14] h-[220px]"
      : item.type === "video"
      ? "aspect-video max-h-[60vh]"
      : item.type === "podcast"
      ? "h-[60vh] max-h-[400px]"
      : "h-[100px]"
  }
            >
              {/* User ko batao ki Embed kyu dikh raha hai (Optional) */}
              {item.type === "song" && isPremium === false && (
                <div className="bg-blue-500/10 text-blue-300 text-[10px] p-1 text-center border-b border-blue-500/20 flex items-center justify-center gap-1">
                  <AlertCircle size={10} /> Preview Mode (Free Account)
                </div>
              )}

              <iframe
                src={embedUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Media Player"
              ></iframe>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-gray-500 text-xs">
              Media unavailable
            </div>
          )}
        </div>

        {/* VISUALIZER BAR */}
        {item.type === "song" && (
          <div className="h-1 w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 relative overflow-visible">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export default MediaModal;
