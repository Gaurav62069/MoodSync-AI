import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GoogleAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Token mil gaya, login process shuru
      loginWithToken(token);
      toast.success("Successfully logged in with Google!");
      
      // Thoda delay taaki user animation dekh sake
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      toast.error("Google authentication failed.");
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    // ✅ FIX: Forced Dark Background & Grid (Ab ye white nahi dikhega)
    <div 
      className="min-h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#050505]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }}
    >
      
      {/* Background Glow Spot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

      {/* ✅ Glass Card */}
      <div className="glass-card p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-white/10 relative z-10 flex flex-col items-center animate-fadeIn">
        
        {/* Animated Loader */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full"></div>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        </div>
        
        {/* Status Text */}
        <h2 className="text-2xl font-bold text-white tracking-tight">Syncing Profile...</h2>
        <p className="text-gray-400 mt-2 text-sm">
          Please wait while we securely log you in.
        </p>

        {/* Manual Redirect Button (Backup) */}
        <button 
          onClick={() => navigate('/')}
          className="mt-8 text-xs text-gray-500 hover:text-white transition-colors underline"
        >
          Taking too long? Click here
        </button>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;