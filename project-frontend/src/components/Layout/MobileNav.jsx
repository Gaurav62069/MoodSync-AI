import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Smile, 
  Radio, 
  BookOpen, 
  Bot, 
  UserIcon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MobileNav = () => {
  const { palette } = useTheme();

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Smile, path: '/mood', label: 'Mood' },
    { icon: Radio, path: '/suggestions', label: 'Feeds' },
    { icon: BookOpen, path: '/journal', label: 'Journal' },
    { icon: Bot, path: '/chat', label: 'Chat' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 lg:hidden">
        {/* Glassmorphism Container */}
        <div className="border-t border-white/10 backdrop-blur-md bg-black/40 px-4 py-3 pb-6 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)]">
            {/* Navigation Links */}
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex flex-col items-center justify-center gap-1 transition-all duration-300 relative min-w-[3rem] ${
                            isActive ? 'text-white -translate-y-1' : 'text-slate-500 hover:text-slate-300'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            <item.icon 
                                size={22} 
                                style={isActive ? { filter: `drop-shadow(0 0 8px ${palette.primary})` } : {}} 
                            />
                            {/* Dot Indicator */}
                            {isActive && (
                                <span 
                                    className="absolute -bottom-2 w-1 h-1 rounded-full" 
                                    style={{ backgroundColor: palette.primary }}
                                ></span>
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </div>
    </div>
  );
};

export default MobileNav;