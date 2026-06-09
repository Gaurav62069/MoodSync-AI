import axios from 'axios';
import qs from 'qs';

let cachedToken = null;
let tokenExpirationTime = 0;

export const getClientCredentialsToken = async () => {
  const currentTime = Date.now();

  if (cachedToken && currentTime < tokenExpirationTime) {
    return cachedToken;
  }

  try {
    console.log('🔄 Fetching new Spotify Access Token...');

    const data = qs.stringify({
      grant_type: 'client_credentials',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    // 👇 REAL SPOTIFY URL
    const response = await axios.post('https://accounts.spotify.com/api/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    cachedToken = response.data.access_token;
    tokenExpirationTime = currentTime + (response.data.expires_in - 300) * 1000;

    console.log('✅ New Spotify Token Cached');
    return cachedToken;

  } catch (error) {
    console.error('🔴 Error fetching Spotify token:', error.response?.data || error.message);
    throw new Error('Failed to retrieve Spotify access token');
  }
};