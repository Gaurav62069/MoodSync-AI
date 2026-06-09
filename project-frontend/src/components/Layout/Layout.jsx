import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import MobileNav from './MobileNav';
import MobileHeader from './MobileHeader'; // --- 1. NEW: Import Header ---
import { motion, AnimatePresence } from 'framer-motion'; 
import { useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';

const Layout = ({ children }) => {
  const location = useLocation(); 
  const loadingBarRef = useRef(null);
const [isReelMode, setIsReelMode] = useState(false);
  useEffect(() => {
    if (loadingBarRef.current) {
      loadingBarRef.current.continuousStart();
      setTimeout(() => {
        loadingBarRef.current.complete();
      }, 500); 
    }
  }, [location]);
  useEffect(() => {
    const handleReelMode = (e) => setIsReelMode(e.detail);
    window.addEventListener('reelModeChange', handleReelMode);
    return () => window.removeEventListener('reelModeChange', handleReelMode);
  }, []);

  return (
    // FIX: Desktop par 'h-screen' aur 'overflow-hidden' (App-like Fixed Layout)
   <div className={`w-full flex transition-colors duration-500 min-h-screen lg:h-screen lg:overflow-hidden ${isReelMode ? 'bg-black' : 'bg-transparent justify-center'}`}>
      
      <LoadingBar color="#3b82f6" ref={loadingBarRef} height={3} shadow={true} />
      {!isReelMode && <MobileHeader />}

      {/* Grid Container */}
      <div className={`w-full transition-all duration-500 h-full ${isReelMode ? 'flex px-0 py-0' : 'lg:w-[95%] max-w-[1920px] grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 px-2 lg:py-6'}`}>

        {/* Left Sidebar (Desktop Only) */}
        <aside className={`hidden lg:flex flex-col h-full z-50 transition-all duration-300 group/sidebar ${isReelMode ? 'w-[80px] hover:w-[240px] absolute left-0 bg-black/90 border-r border-white/10 backdrop-blur-md' : 'col-span-3 overflow-hidden'}`}>
          <Sidebar isReelMode={isReelMode} />
        </aside>

        {/* Main Content Area */}
        {/* --- 3. FIX: 'pt-20' added specifically for Mobile to push content down --- */}
       <main className={`transition-all duration-500 h-full relative flex flex-col ${isReelMode ? 'w-full pl-0 lg:pl-[80px] pt-0' : 'col-span-1 lg:col-span-6 px-2 pt-20 lg:px-0 lg:pt-0 lg:overflow-hidden'}`}>
          
          {/* Scrollable Container 
             - Desktop: h-full + overflow-y-auto (Sirf ye div scroll karega)
             - Mobile: h-auto (Page scroll karega)
          */}
          <div className="h-auto w-full lg:h-full lg:overflow-y-auto no-scrollbar ">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}  
                exit={{ opacity: 0, y: -20 }}   
                transition={{ duration: 0.3, ease: "easeInOut" }} 
                className={`${isReelMode ? 'p-0 h-screen w-full' : 'glass-bg rounded-3xl p-4 md:p-6 min-h-[85vh] md:min-h-full'}`}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

        </main>

        {/* Right Sidebar (Desktop Only) */}
       {!isReelMode && (
          <aside className="hidden lg:flex col-span-3 flex-col h-full overflow-hidden">
            <RightPanel />
          </aside>
        )}
        
      </div>

      {/* Mobile Navigation (Fixed Bottom) */}
    {!isReelMode && <MobileNav />}
      
    </div>
  );
};

export default Layout;