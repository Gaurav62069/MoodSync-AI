import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Lock, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const GamificationCard = ({ user }) => {
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback Badges Metadata (Agar backend se data na aaye toh)
  const BADGE_META = {
    '7_day_streak': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    '30_day_streak': { icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
    '100_points': { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    '500_points': { icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    'early_bird': { icon: Medal, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    'mood_master': { icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
  };

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Try to fetch from backend first
        const { data } = await api.get('/badges');
        setAllBadges(data.data || []);
      } catch (error) {
        console.warn("Could not fetch badges, using fallback display for owned badges.");
        // Agar API fail ho, toh hum user ke badges dikhane ke liye sirf IDs use karenge
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const getBadgeIcon = (id) => {
    // Backend se icon name match karein ya default de dein
    const meta = BADGE_META[id] || { icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-400/10' };
    return meta;
  };

  // User ke unlocked badges filter karein
  const userBadges = user?.badges || [];
  
  // Calculate Progress (Example logic: Next level at every 100 points)
  const nextLevel = Math.ceil((user?.points || 0) / 100) * 100;
  const progress = ((user?.points || 0) / nextLevel) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-3xl border border-white/10 space-y-6 relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

      {/* Header: Points & Streak */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            Your Achievements
          </h3>
          <p className="text-xs text-gray-400 mt-1">Keep going to unlock more!</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Streak Box */}
           <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Streak</span>
              <div className="flex items-center gap-1.5 text-orange-400">
                <Flame size={20} fill="currentColor" />
                <span className="text-2xl font-bold font-mono">{user?.moodLogStreak || 0}</span>
              </div>
           </div>
           
           {/* Points Box */}
           <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Points</span>
              <div className="flex items-center gap-1.5 text-blue-400">
                <Star size={20} fill="currentColor" />
                <span className="text-2xl font-bold font-mono">{user?.points || 0}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Progress Bar to Next Level */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Level {Math.floor((user?.points || 0) / 100) + 1}</span>
          <span>{user?.points || 0} / {nextLevel} XP</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </div>
      </div>

      {/* Badges Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collected Badges</h4>
        
        {userBadges.length === 0 ? (
          <div className="text-center py-6 bg-white/5 rounded-xl border border-white/5 border-dashed">
            <Lock size={24} className="mx-auto text-gray-600 mb-2" />
            <p className="text-xs text-gray-500">No badges yet. Start logging your mood!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {userBadges.map((badgeId, index) => {
              // Agar allBadges (API data) hai toh wahan se detail lo, nahi toh default
              const apiBadge = allBadges.find(b => b.badgeId === badgeId);
              const meta = getBadgeIcon(badgeId);
              const Icon = meta.icon;

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`aspect-square rounded-xl flex items-center justify-center border border-white/10 relative group cursor-pointer ${meta.bg}`}
                >
                   <Icon size={24} className={meta.color} />
                   
                   {/* Tooltip */}
                   <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-black/80 backdrop-blur-md rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 z-20">
                     {apiBadge ? apiBadge.name : badgeId.replace(/_/g, ' ')}
                   </div>
                </motion.div>
              );
            })}
            
            {/* Placeholder for locked badges */}
            {Array.from({ length: Math.max(0, 5 - userBadges.length) }).map((_, i) => (
               <div key={`locked-${i}`} className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center opacity-30">
                 <Lock size={16} className="text-gray-500" />
               </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default GamificationCard;