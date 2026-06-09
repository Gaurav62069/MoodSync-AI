import { useState, useEffect } from 'react';
import api from '../services/api'; // Assuming you have an axios instance setup

export const useMoodHistory = (userId) => {
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMoods = async () => {
      try {
        setLoading(true);
        // Adjust endpoint as per your backend routes
        const response = await api.get('/mood/history'); 
        setMoodData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch mood history');
      } finally {
        setLoading(false);
      }
    };

    if (userId) { // Fetch only if user is logged in
      fetchMoods();
    }
  }, [userId]);

  return { moodData, loading, error };
};