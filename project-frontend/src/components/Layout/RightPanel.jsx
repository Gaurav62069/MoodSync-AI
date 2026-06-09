import React from 'react';
import { Flame, BarChart, MessageSquare, History, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const RightPanel = () => {
  const { user } = useAuth();
  const { palette } = useTheme(); // Theme Context se current color palette

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* --- 1. MINI PROFILE CARD --- */}
      <div className="glass-card p-4 rounded-3xl border border-white/5 flex items-center gap-4">
        <div 
           className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2"
           // Dynamic border color
           style={{ borderColor: palette.primary }}
        >
           {/* Avatar: Agar photo hai toh wo, nahi toh DiceBear */}
           <img 
             src={user?.profilePicture && user.profilePicture !== 'default-avatar.png' 
               ? user.profilePicture 
               : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'User'}`} 
             alt="User" 
             className="w-full h-full object-cover"
           />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-bold text-white truncate text-sm">{user?.username || 'Guest'}</h4>
            <Link to="/profile" className="text-xs flex items-center gap-1 transition-colors" style={{ color: palette.primary }}>
                View Profile <ChevronRight size={10} />
            </Link>
        </div>
      </div>

      {/* --- 2. AI CHATBOT WIDGET (Hero Feature) --- */}
      <div 
        className="glass-bg p-5 rounded-3xl border relative overflow-hidden group active:scale-95 transition-transform duration-300"
        // Dynamic Border & Background Color
        style={{ borderColor: `${palette.primary}30`, backgroundColor: `${palette.primary}10` }}
      >
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} style={{ color: palette.primary }} />
                <span className="font-bold text-sm" style={{ color: palette.primary }}>AI Companion</span>
            </div>
            <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                Feeling overwhelmed? Chat with your personal AI wellness coach anytime.
            </p>
            <Link to="/chat">
                <button 
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg"
                  style={{ backgroundColor: palette.primary, boxShadow: `0 4px 10px ${palette.primary}30` }}
                >
                    Start Chat
                </button>
            </Link>
        </div>
      </div>

      {/* --- 3. STREAK WIDGET --- */}
      <div className="glass-card p-5 rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold" style={{ color: palette.primary }}>{user?.moodLogStreak || 0}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-bold flex items-center gap-1">
            Day Streak <Flame size={12} style={{ color: palette.primary }} fill="currentColor" />
          </p>
        </div>
        {/* Visual Ring (Dynamic Color) */}
        <div className="w-12 h-12 rounded-full border-4 border-white/5" style={{ borderTopColor: palette.primary, borderRightColor: palette.primary, color: palette.primary }}>
            <span className="text-[10px] text-gray-500">Active</span>
        </div>
      </div>

      {/* --- 4. AI FORECAST WIDGET --- */}
      <div className="glass-card p-5 rounded-3xl border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <BarChart className="w-4 h-4" style={{ color: palette.primary }} />
          <span className="font-bold text-sm text-white">Mood Forecast</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed italic">
           {user?.lastForecast?.mood 
             ? `"AI predicts you might feel ${user.lastForecast.mood} tomorrow based on recent patterns."`
             : `"Log your mood daily to unlock personalized AI predictions for tomorrow."`
           }
        </p>
      </div>

      {/* --- 5. QUICK HISTORY LINK --- */}
      <Link to="/history">
        <div className="glass-card mt-5 p-3 rounded-2xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 group-hover:text-white transition-colors" style={{ color: palette.primary }}>
                    <History size={16} />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-white font-medium transition-colors">Recent Activity</span>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
        </div>
      </Link>

    </div>
  );
};

export default RightPanel;