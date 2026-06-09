import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const MOOD_PALETTES = {
  happy: { primary: '#34d399', secondary: '#059669' },    // Green
  calm: { primary: '#60a5fa', secondary: '#3b82f6' },     // Blue
  neutral: { primary: '#a78bfa', secondary: '#8b5cf6' },  // Purple (Default)
  bored: { primary: '#facc15', secondary: '#fbbf24' },    // Yellow
  sad: { primary: '#94a3b8', secondary: '#64748b' },      // Gray
  stressed: { primary: '#fb923c', secondary: '#f97316' }, // Orange
  angry: { primary: '#f87171', secondary: '#ef4444' },    // Red
  excited: { primary: '#ec4899', secondary: '#db2777' },  // Pink
  anxious: { primary: '#c084fc', secondary: '#9333ea' },  // Violet
};

export const ThemeProvider = ({ children }) => {
  // --- 1. Mood State (Existing) ---
  const [currentTheme, setCurrentTheme] = useState('neutral');
  const [palette, setPalette] = useState(MOOD_PALETTES['neutral']);

  // --- 2. NEW: Background Theme State ('grid' or 'noise') ---
  const [bgTheme, setBgTheme] = useState('grid'); // Default Grid rahega

  // --- NEW: Toggle Function (Sidebar button ke liye) ---
  const toggleBgTheme = () => {
    setBgTheme((prev) => (prev === 'grid' ? 'noise' : 'grid'));
  };

 
  // Jab bhi bgTheme change hoga, ye body tag par class update kar dega
  useEffect(() => {
    document.body.classList.remove('theme-grid', 'theme-noise');
    document.body.classList.add(`theme-${bgTheme}`);
  }, [bgTheme]);

  // --- 3. Initial Load: Fetch Last Mood from Backend ---
  useEffect(() => {
    const fetchLastMood = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        const { data } = await api.get('/mood?limit=1');
        const logs = data.moodHistory || data.logs || [];
        
        if (logs.length > 0) {
          const lastMood = logs[0].mood;
          // console.log("🎨 Theme Restored from Backend:", lastMood);
          setCurrentTheme(lastMood);
        }
      } catch (error) {
        console.error("Theme Sync Error:", error);
      }
    };

    fetchLastMood();
  }, []);

  // --- 4. Mood Palette Change Effect ---
  useEffect(() => {
    const safeTheme = (currentTheme || 'neutral').toLowerCase();
    const newPalette = MOOD_PALETTES[safeTheme] || MOOD_PALETTES['neutral'];
    
    setPalette(newPalette);
    
    // Global CSS Variables Update
    document.documentElement.style.setProperty('--primary-color', newPalette.primary);
    document.documentElement.style.setProperty('--secondary-color', newPalette.secondary);
    
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setCurrentTheme, 
      palette,
      bgTheme,       // Current background theme (grid/noise)
      toggleBgTheme  // Function to switch background
    }}>
      {children}
    </ThemeContext.Provider>
  );
};