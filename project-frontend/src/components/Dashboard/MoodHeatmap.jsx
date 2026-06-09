import React from 'react';
import { Calendar } from 'lucide-react';

const MoodHeatmap = ({ moodHistory }) => {
  // --- 1. Mood Colors Helper ---
  const getMoodColor = (mood) => {
    const colors = {
      happy: 'bg-green-500', 
      sad: 'bg-gray-500', 
      angry: 'bg-red-500',
      stressed: 'bg-orange-500', 
      calm: 'bg-blue-400', 
      excited: 'bg-pink-500',
      neutral: 'bg-purple-400', 
      bored: 'bg-yellow-400',
      anxious: 'bg-violet-500'
    };
    return colors[mood?.toLowerCase()] || 'bg-white/5';
  };

  // --- 2. Generate Last 30 Days Array ---
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i)); // Past -> Today
    return d.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  return (
    // FIX: 'w-full' aur 'overflow-hidden' ensure karta hai ki boxes bahar na nikle
    <div className="glass-card p-6 rounded-3xl border border-white/10 w-full overflow-hidden flex flex-col ">
      
      {/* Header */}
      <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
        <span className="flex items-center gap-2">
            <Calendar size={20} className="text-green-400" /> Mood Calendar
        </span>
        <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400 font-normal hidden sm:inline-block">
            Last 30 Days
        </span>
      </h3>
      
      {/* Calendar Grid */}
      <div className="flex-1 w-full">
        {/* FIX: Responsive Grid (Mobile pe 7 cols, Tablet+ pe 10 cols) aur chota gap */}
        <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 sm:gap-2 md:gap-3">
            {days.map((dateStr) => {
            // Find mood log for this specific date
            const log = moodHistory.find(m => m.createdAt.startsWith(dateStr));
            
            return (
                <div 
                key={dateStr}
                title={`${dateStr}: ${log ? log.mood : 'No Log'}`}
                className={`
                    aspect-square rounded-md sm:rounded-lg border border-white/5 shadow-sm transition-all duration-300
                    ${log ? getMoodColor(log.mood) : 'bg-white/5'} 
                    ${log ? 'hover:scale-110 hover:brightness-110 cursor-pointer' : ''}
                `}
                ></div>
            );
            })}
        </div>
      </div>
      
      {/* Legend (Bottom) */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 text-[10px] sm:text-xs text-gray-400 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Happy</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Calm</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Angry</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-500"></div> Sad</div>
        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10 border border-white/20"></div> Empty</div>
      </div>

    </div>
  );
};

export default MoodHeatmap;