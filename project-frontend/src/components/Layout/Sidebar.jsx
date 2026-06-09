import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Smile, 
  BarChart2, 
  Radio, 
  BookOpen, 
  Settings, 
  LogOut,
  Sliders,
  Activity // Reel mode ke icon ke liye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Sidebar = ({ isReelMode }) => {
  const { logout } = useAuth();
  const { toggleBgTheme, palette } = useTheme();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Smile, label: 'Log Mood', path: '/mood' },
    { icon: Radio, label: 'Suggestions', path: '/suggestions' },
    { icon: Sliders, label: 'Personalize', path: '/preferences' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
    { icon: BarChart2, label: 'History', path: '/history' },
    { icon: Settings, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className={`h-full flex flex-col py-6 transition-all duration-300 ${isReelMode ? 'px-3' : 'px-4'}`}>
      
      {/* --- Brand Logo --- */}
      <div 
        className={`mb-10 flex items-center cursor-pointer select-none group transition-opacity hover:opacity-80 overflow-hidden ${isReelMode ? 'px-1' : 'px-2'}`}
        onClick={toggleBgTheme}
        title="Tap to switch theme!"
      >
        {/* 1. ORIGINAL SLEEK LINE (Sirf Normal Mode me dikhegi) */}
        {!isReelMode && (
          <div className="flex-shrink-0 w-1.5 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.6)] transition-shadow mr-3"></div>
        )}

        {/* 2. COMPACT LOGO (Sirf Reel Mode me dikhega) */}
        {isReelMode && (
           <div className="flex-shrink-0 flex items-center justify-center mr-4 hover:scale-105 transition-transform">
             <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="56" height="56" rx="16" strokeWidth="2"/>
                <path 
                  d="M18 32C18 32 22 20 28 32C34 44 38 20 44 32C50 44 54 32 54 32" 
                  stroke="url(#paint1_linear_sidebar)" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle cx="44" cy="32" r="3" fill="#22c55e">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <defs>
                  <linearGradient id="paint1_linear_sidebar" x1="18" y1="32" x2="54" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#d946ef"/> 
                    <stop offset="1" stopColor="#3b82f6"/> 
                  </linearGradient>
                </defs>
              </svg>
           </div>
        )}
        
        {/* Brand Text */}
        <div className={`transition-all duration-300 flex flex-col overflow-hidden ${
          isReelMode 
            ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100' 
            : 'w-auto opacity-100'
        }`}>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all whitespace-nowrap" style={{ color: palette.primary }}>
            MoodSync
          </h1>
          <span className="text-[10px] text-slate-400 tracking-widest uppercase whitespace-nowrap mt-0.5">AI Assistant</span>
        </div>
      </div>

      {/* --- Navigation --- */}
      <nav className=" space-y-2 flex-1 overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            // Wapas original 'py-3.5' padding laga di jisse height badhiya lage
            className={({ isActive }) =>
              `flex items-center py-3.5 my-2 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                isReelMode ? 'px-3.5 w-max group-hover/sidebar:w-full' : 'px-4 w-full'
              } ${
                isActive
                  ? ' glass-card text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={20} 
                  className={`flex-shrink-0 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} 
                />
                
                <span className={`font-medium tracking-wide text-sm whitespace-nowrap transition-all duration-300 ${
                  isReelMode 
                    ? 'opacity-0 w-0 ml-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-4' 
                    : 'opacity-100 w-auto ml-4'
                }`}>
                  {item.label}
                </span>

                {isActive && !isReelMode && (
                   <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- Logout Button --- */}
      <div className="pt-4 border-t border-white/5 mt-2 overflow-x-hidden">
        <button 
          onClick={logout}
          className={`flex items-center py-3.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/10 group overflow-hidden ${
            isReelMode ? 'px-3.5 w-max group-hover/sidebar:w-full' : 'px-4 w-full'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 ${
            isReelMode 
              ? 'opacity-0 w-0 ml-0 group-hover/sidebar:opacity-100 group-hover/sidebar:w-auto group-hover/sidebar:ml-4' 
              : 'opacity-100 w-auto ml-4'
          }`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;