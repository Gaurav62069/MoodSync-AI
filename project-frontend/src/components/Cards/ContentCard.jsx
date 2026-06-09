import React from 'react';
import { ExternalLink, PlayCircle, Film, BookOpen, Newspaper, Smile, CheckCircle, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

const ContentCard = ({ item, onClick }) => {
  
  // Helper to choose icon based on type
  const getIcon = () => {
    switch (item.type) {
      case 'movie': return <Film size={16} />;
      case 'song': return <PlayCircle size={16} />;
      case 'podcast': return <Mic size={16} />;
      case 'book': return <BookOpen size={16} />;
      case 'news': return <Newspaper size={16} />;
      case 'video': return <PlayCircle size={16} />;
      default: return <ExternalLink size={16} />;
    }
  };

  // Fallback image logic
  const imageUrl = item.image_url || item.poster_path || 'https://via.placeholder.com/400x225/000000/ffffff?text=No+Image';

  // --- 1. SPECIAL CARD FOR JOKES (Clean Glass) ---
  if (item.type === 'joke') {
    const jokeText = item.joke || (item.setup ? `${item.setup} ... ${item.delivery}` : item.content) || "Enjoy a smile!";
    
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group cursor-default"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Smile size={100} className="text-white" />
        </div>
        <div className="relative z-10">
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3 block">Daily Joke</span>
            <h3 className="text-xl font-bold text-white leading-relaxed font-serif italic">
                "{jokeText}"
            </h3>
        </div>
      </motion.div>
    );
  }

  // --- 2. SPECIAL CARD FOR TASKS (Clean Glass) ---
  if (item.type === 'task') {
    return (
      <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card p-6 rounded-3xl border border-white/10 flex items-start gap-4 cursor-default"
      >
        <div className="p-3 bg-white/10 rounded-full text-white shrink-0 mt-1">
            <CheckCircle size={24} />
        </div>
        <div>
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Suggested Task</span>
            <h3 className="text-lg font-bold text-white mt-1">{item.title || "Wellness Activity"}</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              {item.description || item.content || "A small step for better wellness."}
            </p>
        </div>
      </motion.div>
    );
  }

  // --- 3. STANDARD IMAGE CARD (Movies, Songs, Books, Podcasts, News, Videos) ---
  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      className="glass-card rounded-2xl overflow-hidden border border-white/10 group cursor-pointer relative transition-all hover:border-white/30"
      onClick={onClick}
    >
      {/* --- Image Section --- */}
      <div className="h-48 w-full overflow-hidden relative">
        <img 
            src={imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
           <div className="p-3 bg-white/10 rounded-full text-white border border-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300">
             {['song', 'video', 'podcast'].includes(item.type) ? (
               <PlayCircle size={32} fill="white" className="text-transparent" />
             ) : (
               <ExternalLink size={24} />
             )}
           </div>
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-md flex items-center gap-2 border border-white/10">
          {getIcon()}
          <span className="uppercase tracking-wider">{item.type}</span>
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white line-clamp-1 mb-2 group-hover:text-white/90 transition-colors">
          {item.title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
          {item.content || item.description || "Check this out to lift your mood!"}
        </p>
      </div>
    </motion.div>
  );
};

export default ContentCard;