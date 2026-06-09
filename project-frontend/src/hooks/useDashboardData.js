import { useState, useEffect } from 'react';
import api from '../services/api';
import { getMoodScore } from '../utils/helpers';

const useDashboardData = () => {
  const [data, setData] = useState({
    stats: null,
    latestMood: null,
    chartData: [],
    moodHistory: [],
    activityData: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Parallel API Calls (Faster than awaiting one by one)
        const [profileRes, historyRes, activityRes] = await Promise.allSettled([
          api.get('/users/profile'),
          api.get('/mood?limit=30'),
          api.get('/activity/stats')
        ]);

        // 1. Process Profile Stats
        const stats = profileRes.status === 'fulfilled' ? profileRes.value.data : null;

        // 2. Process Mood History & Chart Data
        let moodHistory = [];
        let latestMood = null;
        let chartData = [];

        if (historyRes.status === 'fulfilled') {
          moodHistory = historyRes.value.data.moodHistory || [];
          
          if (moodHistory.length > 0) {
            latestMood = moodHistory[0];
            
            // Prepare Chart Data (Last 7 entries reversed for graph)
            chartData = moodHistory.slice(0, 7).reverse().map(log => ({
              day: new Date(log.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
              score: getMoodScore(log.mood),
              mood: log.mood
            }));
          }
        }

        // 3. Process Activity Data
        const activityData = activityRes.status === 'fulfilled' ? activityRes.value.data : [];

        setData({
          stats,
          latestMood,
          moodHistory,
          chartData,
          activityData
        });

      } catch (err) {
        console.error("Dashboard Data Error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { ...data, loading, error };
};

export default useDashboardData;