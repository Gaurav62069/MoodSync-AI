import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { History, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const MobileHeader = () => {
  const { user } = useAuth();
  const { toggleBgTheme } = useTheme();
  const location = useLocation();

  // --- Helper: Get Page Title based on Path ---
  const getPageTitle = (path) => {
    switch (path) {
      case '/mood': return 'Mood Logger';
      case '/suggestions': return 'Feeds';
      case '/journal': return 'Journal';
      case '/chat': return 'AI Chat';
      case '/history': return 'Activity History';
      case '/profile': return 'Profile';
      case '/settings': return 'Settings';
      default: return 'MoodSync';
    }
  };

  const isHome = location.pathname === '/';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="fixed top-0 left-0 w-full z-50 lg:hidden">
      
      {/* Seamless Glass Container */}
      <div className=" border-b border-white/10 backdrop-blur-md bg-black/40 px-4 py-2 flex justify-between items-center shadow-sm relative min-h-[60px]">
        
        {/* --- LEFT SIDE: Profile + Page Title --- */}
        <div className="flex items-center gap-3 z-10">
            
            {/* Profile Picture */}
            <Link to="/profile" className="relative group shrink-0">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 group-hover:border-white/50 transition-all shadow-md">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <User size={18} className="text-slate-400" />
                  </div>
                )}
              </div>
            </Link>

            {/* Page Title (Only if NOT Home) */}
            {/* Left aligned, right next to profile */}
            {!isHome && (
                <h1 className="text-[19px] font-bold text-gray-300 tracking-wide animate-in fade-in slide-in-from-left-4 duration-300">
                  {pageTitle}
                </h1>
            )}
        </div>

        {/* --- CENTER: Brand Logo (Only if Home) --- */}
        {/* Absolutely positioned to stay perfectly centered */}
        {isHome && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300 pt-1 z-0"
              onClick={toggleBgTheme}
              title="Tap to switch theme!"
            >
              <svg width="70" height="70" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            
            {/* 1. Background Shape (Dark Card) */}
            <rect 
              x="4" y="4" width="56" height="56" rx="16" 
            //   fill="#1e1e24" 
            //   stroke="url(#paint0_linear)" 
              strokeWidth="2"
            />
            
            {/* 2. Pulse Line (Heartbeat/Wave) */}
            <path 
              d="M18 32C18 32 22 20 28 32C34 44 38 20 44 32C50 44 54 32 54 32" 
              stroke="url(#paint1_linear)" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* 3. Animated Glowing Dot */}
            <circle cx="44" cy="32" r="3" fill="#22c55e">
              <animate 
                attributeName="opacity" 
                values="1;0.3;1" 
                dur="2s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* 4. Gradients Definitions */}
            <defs>
              <linearGradient id="paint0_linear" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa"/> 
                <stop offset="1" stopColor="#3b82f6"/> 
              </linearGradient>
              <linearGradient id="paint1_linear" x1="18" y1="32" x2="54" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#d946ef"/> 
                <stop offset="1" stopColor="#3b82f6"/> 
              </linearGradient>
            </defs>
          </svg>
            </div>
        )}

        {/* --- RIGHT SIDE: Activity History Icon --- */}
        <div className="z-10">
          <Link to="/history" className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all block">
              <History size={24} />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default MobileHeader;