import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { spotifyApi } from '../../services/api';
import toast from 'react-hot-toast';

const SpotifyCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const calledRef = useRef(false); // Double call rokne ke liye (React 18 strict mode)

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Spotify connection failed');
      navigate('/profile');
      return;
    }

    if (code && !calledRef.current) {
      calledRef.current = true;
      
      const connect = async () => {
        try {
          await spotifyApi.connectSpotify(code);
          toast.success('Spotify Connected Successfully! 🎵');
        } catch (error) {
          console.error(error);
          toast.error('Failed to connect Spotify');
        } finally {
          navigate('/profile'); // Wapas profile par bhejo
        }
      };
      
      connect();
    }
  }, [searchParams, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connecting to Spotify...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
      </div>
    </div>
  );
};

export default SpotifyCallback;