import React, { useState, useEffect, useRef, useCallback } from 'react';
import api, { logContent } from '../../services/api';
import { Film, Music, Book, Video, Newspaper, Smile, CheckSquare, Mic, ChevronLeft, ChevronRight, Clapperboard, ArrowLeft } from 'lucide-react';
import ContentCard from '../../components/Cards/ContentCard';
import { CardSkeleton } from '../../components/UI/Skeleton';
import { usePlayer } from '../../context/PlayerContext';
// 👇 Animation aur Reel Viewer import
import { AnimatePresence, motion } from 'framer-motion';
import ReelViewer from '../../components/UI/ReelViewer';

const Suggestions = () => {
  const [currentMood, setCurrentMood] = useState('neutral'); 
  const [activeTab, setActiveTab] = useState('movie'); 
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 👇 Reel Viewer States
  const [showReelViewer, setShowReelViewer] = useState(false);
  const [initialReelIndex, setInitialReelIndex] = useState(0);
  const activeReelRef = useRef(null); // Unmount par track karne ke liye

  // 👇 Player Context se closeMedia aur playMedia nikala
  const { playMedia, closeMedia } = usePlayer();
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const abortControllerRef = useRef(null); 
  const tabsRef = useRef(null);

  const scrollLeft = () => { if (tabsRef.current) tabsRef.current.scrollBy({ left: -200, behavior: 'smooth' }); };
  const scrollRight = () => { if (tabsRef.current) tabsRef.current.scrollBy({ left: 200, behavior: 'smooth' }); };
const prepareForPlayer = (item) => {
    if (!item) return null;
    
    // Agar video_url pehle se hai
    if (item.video_url) return item;

    // Agar YouTube ID hai
    if (item.contentId) {
        return {
            ...item,
            video_url: `https://www.youtube.com/embed/${item.contentId}`,
            // 👇 CHANGE: Agar reel hai toh type 'reel' hi rehne do, 'video' mat karo
            // Taaki MediaModal isko vertical shape de sake
            type: item.type === 'reel' ? 'reel' : (item.type || 'video')
        };
    }
    return item;
  };
  // --- 1. Fetch User Mood ---
  useEffect(() => {
    const fetchUserMood = async () => {
      try {
        const { data } = await api.get('/mood?limit=1');
        const logs = data.moodHistory || data.logs || [];
        const latestMood = logs.length > 0 ? logs[0].mood : 'neutral';
        setCurrentMood(latestMood);
      } catch (error) {
        setCurrentMood('neutral');
      }
    };
    fetchUserMood();
  }, []);

  // --- 2. Data Fetching Logic ---
  const fetchSuggestions = useCallback(async (reset = false) => {
    if (!currentMood) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    if (reset) {
        setContent([]);
        setPage(1);
        setHasMore(true);
        // Agar tab change ho to reel viewer band karo (unless reel tab hi ho)
        if(activeTab !== 'reel') setShowReelViewer(false);
    }

    try {
      const currentPage = reset ? 1 : page;
      const endpoint = `/suggestions/${activeTab}?mood=${currentMood}&page=${currentPage}&limit=24`;
      const { data } = await api.get(endpoint, { signal: abortControllerRef.current.signal });
      
      let newItems = Array.isArray(data) ? data : (data.data || [data]);
      newItems = newItems.filter(item => item && Object.keys(item).length > 0);
      
      const processedItems = newItems.map(item => ({
  ...item,
  title:
    item.title ||
    item.name ||
    item.original_title ||
    'Untitled',

  description:
    item.description ||
    item.overview ||
    item.content ||
    '',

  image_url:
    item.image_url ||
    item.poster_path ||
    item.thumbnail ||
    null,

  type: activeTab,
  uniqueId:
    item.contentId ||
    item.id ||
    crypto.randomUUID(),
}));


      setContent(prev => {
          if (reset) return processedItems;
          const existingIds = new Set(prev.map(p => p.uniqueId));
          const uniqueNewItems = processedItems.filter(item => !existingIds.has(item.uniqueId));
          return [...prev, ...uniqueNewItems];
      });
      if (newItems.length === 0) setHasMore(false);
    } catch (error) {
      if (error.name !== 'CanceledError') { 
        if(reset) setContent([]);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentMood, page]); 

  useEffect(() => { fetchSuggestions(true); }, [activeTab, currentMood]); 

  // --- 3. Page Unmount Handling (Reel to Mini Player) ---
 useEffect(() => {
    return () => {
      // Yeh code tab chalega jab component ASLI mein unmount hoga (Page Change)
      if (activeReelRef.current) {
        playMedia(prepareForPlayer(activeReelRef.current));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 IMPORTANT: Dependency array empty rakha hai taaki context update par trigger na ho

  // --- Minimize Handler ---
  const handleMinimizeReel = (reelItem) => {
    // Explicit minimize par player start karo
    playMedia(prepareForPlayer(reelItem));
    setShowReelViewer(false);
    activeReelRef.current = null;
  };

  const handleCloseReel = () => {
    setShowReelViewer(false);
    activeReelRef.current = null;
  };

  // --- 4. Card Click Handler (Updated) ---
  const handleCardClick = (item, index) => {
    // Analytics logging
    if (item.type !== 'joke' && item.type !== 'task') {
        logContent({
            type: item.type,
            title: item.title,
            contentId: item.contentId || item.id || item.uniqueId,
            source: item.source || 'Internal'
        });
    }

    // A. Agar REEL hai
    if (item.type === 'reel') {
        // Step 1: Purana gaana band karo (Conflict Fix)
        if (closeMedia) closeMedia();
        
        // Step 2: Reel Viewer start karo
        setInitialReelIndex(index);
        setShowReelViewer(true);
        
        // Step 3: Current reel ko track karo (Unmount ke liye)
        activeReelRef.current = item;
        return;
    }

    // B. Baaki items ke liye logic
    if (['movie', 'book', 'news'].includes(item.type)) {
       let targetUrl = item.video_url || item.book_url || item.news_url || item.url || item.homepage || item.link;
       if (!targetUrl && item.title) {
           if (item.type === 'movie') {
               // Google Search Fallback
               targetUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + " movie watch")}`;
           } else if (item.type === 'book') {
               targetUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title + " book")}`;
           }
       }

       if (targetUrl) {
           window.open(targetUrl, '_blank');
       } else {
           console.warn("No URL found for item:", item);
       }
       // FIX END
    } else if (!['task', 'joke'].includes(item.type)) {
       playMedia(item);
    }
  };

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1); 
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => { if (page > 1) fetchSuggestions(false); }, [page]);
useEffect(() => {
    window.dispatchEvent(new CustomEvent('reelModeChange', { detail: showReelViewer }));
    return () => {
      // Unmount hone pe wapas normal mode
      window.dispatchEvent(new CustomEvent('reelModeChange', { detail: false }));
    };
  }, [showReelViewer]);
  const tabs = [
    { id: 'movie', label: 'Movies', icon: Film },
    { id: 'song', label: 'Music', icon: Music },
    { id: 'podcast', label: 'Podcasts', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'reel', label: 'Reels', icon: Clapperboard },
    { id: 'book', label: 'Books', icon: Book },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'joke', label: 'Jokes', icon: Smile },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
  ];

 return (
  <div className={`mx-auto space-y-8 animate-fadeIn relative min-h-screen ${showReelViewer ? 'max-w-full' : 'max-w-6xl'}`}>
    
   {!showReelViewer && (
    <>
    <div>
      <h2 className="text-3xl font-bold text-white">
        Curated for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase">{currentMood}</span> mood
      </h2>
      <p className="text-gray-400 mt-2">AI-powered recommendations to match your vibe.</p>
    </div>
    

    <div className="relative group">
      <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hidden group-hover:flex border border-white/10"><ChevronLeft size={20} /></button>
      
      <div ref={tabsRef} className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // Agar user reel dekh raha hai aur kisi dusre tab par click kare, toh viewer band ho jaye
              if(tab.id !== 'reel') setShowReelViewer(false); 
            }}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all border ${
              activeTab === tab.id 
                ? 'text-blue-500 border-blue-500 bg-blue-500/5' 
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hidden group-hover:flex border border-white/10"><ChevronRight size={20} /></button>
    </div>
    </>
)}


    {/* Main Content Area */}
    <AnimatePresence mode="wait">
      {showReelViewer ? (
          <motion.div
            key="reel-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ReelViewer 
                reels={content} 
                initialIndex={initialReelIndex}
                onClose={handleCloseReel}
                onMinimize={handleMinimizeReel}
            />
          </motion.div>
      ) : (
          <motion.div 
              key="grid-view"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
              {content.map((item, index) => {
                  const key = item.uniqueId || index;
                  const card = (
                      <ContentCard 
                          key={key} 
                          item={item} 
                          onClick={() => handleCardClick(item, index)} 
                      />
                  );
                  
                  if (content.length === index + 1) {
                      return <div ref={lastElementRef} key={key}>{card}</div>;
                  }
                  return card;
              })}
              {loading && Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={`skeleton-${i}`} />)}
          </motion.div>
      )}
    </AnimatePresence>

    {!loading && content.length === 0 && (
      <div className="text-center py-20 text-gray-500">No suggestions found for {currentMood}.</div>
    )}
  </div>
);
};

export default Suggestions;