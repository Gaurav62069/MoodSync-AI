import React, { useRef, useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, Minimize2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ReelViewer = ({ reels, initialIndex, onClose, onMinimize }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef(null);

  // --- 1. Scroll Detection to Auto-Play/Pause ---
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== currentIndex && index < reels.length) {
        setCurrentIndex(index);
      }
    }
  };

  // --- 2. Auto-focus initial element on mount ---
  useEffect(() => {
    if (containerRef.current) {
      const element = containerRef.current.children[initialIndex];
      if (element) element.scrollIntoView({ behavior: 'auto' });
    }
  }, [initialIndex]);

  // --- 3. Helper to get Video URL ---
  const getVideoSrc = (item) => {
    // Agar YouTube ID hai (Shorts/Videos)
    if (item.contentId && !item.video_url) {
        return `https://www.youtube.com/embed/${item.contentId}?autoplay=1&controls=0&loop=1&playlist=${item.contentId}&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
    }
    // Agar direct URL hai (MP4 etc)
    return item.video_url;
  };

  const currentReel = reels[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 w-full h-[100dvh] bg-black overflow-hidden flex justify-center"
    >
      {/* --- Top Controls --- */}
      <div className="absolute top-4 right-4 z-20 flex gap-3">
        <button 
           onClick={() => onMinimize(currentReel)}
           className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition border border-white/10"
           title="Minimize to Player"
        >
            <Minimize2 size={20} />
        </button>
        <button 
           onClick={onClose}
           className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-red-500/20 hover:text-red-400 transition border border-white/10"
        >
            <X size={20} />
        </button>
      </div>

      {/* --- Mute Toggle --- */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 left-4 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full text-white/70 hover:text-white border border-white/10"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* --- Vertical Scroll Container --- */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full md:max-w-md h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative bg-black"
      >
        {reels.map((item, index) => {
           const isActive = index === currentIndex;
           const src = getVideoSrc(item);
           
           return (
             <div key={item.uniqueId || index} className="w-full h-full snap-start relative flex items-center justify-center bg-black overflow-hidden">
                
                {/* Video Player Area */}
                <div className="w-full h-full relative overflow-hidden pointer-events-none md:pointer-events-auto">
                    {/* Performance Optimization: Sirf active slide (aur aas-paas) ka video render karein */}
                    {Math.abs(currentIndex - index) <= 1 && (
                        item.contentId ? (
                            <iframe 
                                src={isActive ? src : src.replace('autoplay=1', 'autoplay=0')}
                                className="w-full h-full aspect-[9/16]"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={item.title}
                            ></iframe>
                        ) : (
                            <video 
                                src={src}
                                className="w-full h-full object-cover"
                                autoPlay={isActive}
                                loop
                                muted={isMuted}
                                playsInline
                            />
                        )
                    )}
                </div>

                {/* --- Overlay Content (Instagram Style) --- */}
                <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-32 pointer-events-none">
                    <div className="flex items-end justify-between pointer-events-auto">
                        <div className="flex-1 mr-14">
                            {/* User Info */}
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                                    <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.source || 'User'}`} 
                                        alt="Avatar" 
                                        className="w-full h-full rounded-full bg-black block"
                                    />
                                </div>
                                <span className="text-white font-bold text-sm shadow-black drop-shadow-md">{item.source || 'MoodSync AI'}</span>
                                <button className="text-[10px] font-bold border border-white/30 px-3 py-1 rounded-full text-white/90 ml-2 backdrop-blur-md hover:bg-white/20 transition">Follow</button>
                            </div>
                            
                            {/* Title & Desc */}
                            <h3 className="text-white text-base font-semibold line-clamp-2 mb-1 drop-shadow-md">{item.title}</h3>
                            <p className="text-white/70 text-xs line-clamp-1">{item.description}</p>
                            
                            {/* Audio Tag */}
                            <div className="flex items-center gap-2 mt-3 text-white/80 text-xs">
                                <div className="flex gap-1 items-end h-3">
                                    <div className="w-[2px] h-full bg-white animate-pulse"></div>
                                    <div className="w-[2px] h-2/3 bg-white animate-pulse delay-75"></div>
                                    <div className="w-[2px] h-full bg-white animate-pulse delay-150"></div>
                                </div>
                                <span className="truncate max-w-[200px]">{item.title} - Original Audio</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Side Actions (Right Side) --- */}
                <div className="absolute bottom-8 right-2 flex flex-col gap-6 items-center z-10 pointer-events-auto">
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Heart size={28} className="text-white drop-shadow-lg group-active:scale-75 transition-transform" />
                        </div>
                        <span className="text-white text-[10px] font-medium drop-shadow-md">Like</span>
                    </button>
                    
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <MessageCircle size={28} className="text-white drop-shadow-lg" />
                        </div>
                        <span className="text-white text-[10px] font-medium drop-shadow-md">Comment</span>
                    </button>
                    
                    <button className="flex flex-col items-center gap-1 group">
                        <div className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Share2 size={28} className="text-white drop-shadow-lg" />
                        </div>
                        <span className="text-white text-[10px] font-medium drop-shadow-md">Share</span>
                    </button>

                    <div className="mt-2 w-8 h-8 rounded-md overflow-hidden border-2 border-white/20">
                         <img 
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.title}`} 
                            alt="music cover" 
                            className="w-full h-full object-cover animate-spin-slow"
                        />
                    </div>
                </div>

             </div>
           );
        })}
      </div>
    </motion.div>
  );
};

export default ReelViewer;