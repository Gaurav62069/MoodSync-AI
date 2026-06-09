import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Header = ({ user, palette }) => {
  // Time ke hisaab se Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    // FIX 1: Mobile par column, Desktop par row. Items alignment bhi adjust kiya.
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
      
      {/* Left Side: Greeting */}
      <div className="w-full md:w-auto">
        {/* FIX 2: Responsive Text Sizes (3xl on mobile, 4xl on desktop) */}
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
          {getGreeting()}, <br className="md:hidden" /> {/* Mobile par line break */}
          <span style={{ color: palette.primary }}>
            {user?.username || 'Friend'}
          </span>!
        </h1>
        
        {/* Subtitle adjustment */}
        <p className="text-gray-400 mt-1 md:mt-2 text-sm md:text-lg">
          Your wellness overview.
        </p>
      </div>
      
      {/* Right Side: Action Button */}
      {/* FIX 3: Link aur Button ko mobile par full width kiya */}
      <Link to="/mood" className="w-full md:w-auto">
          <button 
            className="w-full md:w-auto text-black px-6 py-3 rounded-xl md:rounded-full font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg active:scale-95"
            style={{ backgroundColor: palette.primary }}
          >
              Log Mood <ArrowRight size={18} />
          </button>
      </Link>
      
    </div>
  );
};

export default Header;