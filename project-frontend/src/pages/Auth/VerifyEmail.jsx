import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams(); // URL se token nikalo
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  
  // --- 🔒 LOCK: Double Call Rokne ke liye (React Strict Mode Fix) ---
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    // Agar pehle se call ja chuki hai, toh turant ruk jao
    if (hasCalledAPI.current) return;

    const verifyToken = async () => {
      hasCalledAPI.current = true; // Lock lagao

      try {
        // Backend API call
        await api.get(`/auth/verify-email/${token}`);
        
        setStatus('success');
        toast.success("Email verified successfully!");
        
        // 3 seconds baad Dashboard par redirect
        setTimeout(() => {
          navigate('/'); 
        }, 3000);

      } catch (error) {
        console.error("Verification Error:", error);
        setStatus('error');
        toast.error(error.response?.data?.message || "Verification failed.");
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, navigate]);

  return (
    // ✅ Main Container: Transparent taaki body ka Grid/Aurora theme dikhe
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-transparent">
      
      {/* --- Ambient Glow (Optional) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      {/* ✅ Glass Card Container */}
      <div className="glass-card p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/10 relative z-10 animate-fadeIn">
        
        {/* --- 1. LOADING STATE --- */}
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-400 animate-spin mb-6 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Verifying...</h2>
            <p className="text-gray-400 mt-2 text-sm">Please wait while we verify your email.</p>
          </div>
        )}

        {/* --- 2. SUCCESS STATE --- */}
        {status === 'success' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="mb-6 rounded-full bg-green-500/20 p-4 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
               <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Email Verified!</h2>
            <p className="text-gray-300 mt-2 text-sm">Your email has been successfully updated.</p>
            
            <div className="mt-8 flex flex-col items-center gap-3 w-full">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Redirecting in 3s...</p>
                <button 
                  onClick={() => navigate('/')} 
                  className="w-full bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all text-sm font-medium hover:scale-[1.02]"
                >
                  Go to Dashboard Now
                </button>
            </div>
          </div>
        )}

        {/* --- 3. ERROR STATE --- */}
        {status === 'error' && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="mb-6 rounded-full bg-red-500/20 p-4 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
               <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Verification Failed</h2>
            <p className="text-gray-300 mt-2 text-sm">The link is invalid or has expired.</p>
            
            <button 
              onClick={() => navigate('/login')} 
              className="mt-8 w-full bg-white/10 border border-white/20 px-6 py-3 rounded-xl text-white hover:bg-white/20 transition-all text-sm font-medium hover:scale-[1.02]"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;