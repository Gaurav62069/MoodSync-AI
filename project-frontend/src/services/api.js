//api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Auth Interceptor: Automatic token attachment
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- User & Auth APIs ---
export const getProfile = () => api.get('/users/profile');
export const updatePreferences = (data) => api.put('/users/profile', { preferences: data });

// --- ADMIN API FUNCTIONS ---
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}`, { role });
  return response.data;
};

export const toggleBlockUser = async (id) => {
  const response = await api.patch(`/admin/users/${id}/toggle-block`);
  return response.data;
};

// --- Mood & AI APIs ---
export const analyzeText = (text) => api.post('/ai/analyze-text', { text });
export const logMood = (moodData) => api.post('/moods', moodData);

/**
 * FIXED: Adding missing logContent export for Suggestions.jsx
 */
export const logContent = async (contentData) => {
  try {
    const response = await api.post('/content-log', contentData);
    return response.data;
  } catch (error) {
    console.error("Failed to log content view:", error);
    return null;
  }
};

// --- Spotify API Helpers ---
export const spotifyApi = {
  getAuthUrl: async () => {
    const res = await api.get('/spotify/auth-url');

    // 🔥 FORCE STRING RETURN
    if (typeof res.data === "string") {
      return { url: res.data };
    }

    if (res.data?.url) {
      return { url: res.data.url };
    }

    throw new Error("Invalid Spotify auth URL response");
  },

  connectSpotify: (code) => api.post('/spotify/connect', { code }),
  getAccessToken: async () => {
  const res = await api.get('/spotify/token');
  return res.data; 
},

};



export default api;