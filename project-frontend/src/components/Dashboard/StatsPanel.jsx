import React from 'react';
import { Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsPanel = ({ stats, palette }) => {
  return (
    <div className="space-y-6">
        {/* 1. Daily Streak Card */}
        <motion.div whileHover={{ scale: 1.02 }} className="glass-card p-6 rounded-3xl flex items-center justify-between border border-white/10">
            <div>
                <p className="text-gray-400 text-sm font-medium">Daily Streak</p>
                <p className="text-4xl font-bold mt-1" style={{ color: palette.primary }}>{stats?.moodLogStreak || 0}</p>
            </div>
            <div className="p-4 rounded-full" style={{ backgroundColor: `${palette.primary}20`, color: palette.primary }}>
                <Flame size={32} />
            </div>
        </motion.div>

        {/* 2. AI Insight Card */}
        <div className="glass-card p-6 rounded-3xl border border-white/10">
             <div className="flex items-center gap-2 mb-3" style={{ color: palette.primary }}>
                <Activity size={18} />
                <span className="font-bold text-sm">AI Forecast</span>
             </div>
             <p className="text-gray-300 text-sm leading-relaxed italic">
                {stats?.lastForecast?.mood 
                    ? `"Based on your patterns, AI predicts you might feel ${stats.lastForecast.mood} tomorrow."` 
                    : "Log your mood daily to unlock personalized AI predictions for tomorrow."}
             </p>
        </div>

        {/* Removed redundant 'History' link. Access history from Sidebar now. */}
    </div>
  );
};

export default StatsPanel;