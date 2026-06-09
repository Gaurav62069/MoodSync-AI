import React from 'react';
import { Sparkles, ArrowRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroCard = ({ latestMood }) => {
  
  // --- Subtle Color Tints (Halka glass tint based on mood) ---
  const getGlassTint = (mood) => {
    switch (mood?.toLowerCase()) {
      case 'happy': 
        return 'from-emerald-500/10 to-transparent border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]';
      case 'sad': 
        return 'from-blue-500/10 to-transparent border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.05)]';
      case 'angry': 
        return 'from-red-500/10 to-transparent border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]';
      case 'excited': 
        return 'from-pink-500/10 to-transparent border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.05)]';
      case 'bored':
        return 'from-yellow-500/10 to-transparent border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.05)]';
      case 'stressed':
        return 'from-orange-500/10 to-transparent border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]';
      default: 
        return 'from-violet-500/10 to-transparent border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.05)]';
    }
  };

  const activeStyle = latestMood ? getGlassTint(latestMood.mood) : 'from-white/5 to-transparent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      // 'glass-card' class transparency aur blur handle karegi
      // 'bg-gradient-to-br' halka sa color tint dega
      className={`relative w-full overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${activeStyle} glass-card group min-h-[260px] flex flex-col justify-between`}
    >
        {/* Glow Orb (Peeche ghumne wala light effect) */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-[60px] group-hover:bg-white/10 transition-all duration-700"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            {/* Top Row: Badge */}
            <div className="flex justify-between items-start">
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 flex items-center gap-2 text-white/70 backdrop-blur-md">
                    <Sparkles size={14} className="text-yellow-300" />
                    <span className="text-[11px] font-semibold tracking-widest uppercase">AI Analysis</span>
                </div>
                
                {/* Live Indicator */}
                <div className="flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></div>
                </div>
            </div>

            {/* Middle: Mood Text */}
            <div className="mt-2">
                <h2 className="text-6xl font-light text-white tracking-tight capitalize drop-shadow-lg">
                    {latestMood ? latestMood.mood : 'No Data'}
                </h2>
                <p className="text-white/50 mt-2 text-base font-light max-w-lg line-clamp-2 leading-relaxed">
                    {latestMood?.notes || "Your mood journey is empty. Let's start tracking."}
                </p>
            </div>

            {/* Bottom: Action Area */}
            {latestMood && (
              <div className="mt-6 flex items-center gap-6 border-t border-white/5 pt-4">
                 <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                    <Activity size={12} />
                    <span>Source: {latestMood.source}</span>
                 </div>
                 
                 <div className="ml-auto">
                   <button className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                      Details <ArrowRight size={14} />
                   </button>
                 </div>
              </div>
            )}
        </div>
    </motion.div>
  );
};

export default HeroCard;