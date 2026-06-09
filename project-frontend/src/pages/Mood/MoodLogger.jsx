import React, { useState } from 'react';
import { Mic, Type, Camera, Sparkles, Award, Zap } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext'; 
import api from '../../services/api'; 
import toast from 'react-hot-toast'; 

import TextAnalysis from './TextAnalysis';
import VoiceAnalysis from './VoiceAnalysis';
import FaceAnalysis from './FaceAnalysis';

const MoodLogger = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [result, setResult] = useState(null);
  const [earnedBadge, setEarnedBadge] = useState(null); 
  const { setCurrentTheme } = useTheme(); 

  const handleAnalysisComplete = async (data) => {
    setResult(data); 
    
    // Agar Result null hai (Retake), toh return kar jao
    if (!data) return; 
    
    if (data.mood) {
        // Theme update karo
        setCurrentTheme(data.mood.toLowerCase());
    }

    try {
      // Sirf 'face' ke liye API call yahan handle ho rahi hai
      if (activeTab === 'face' && data.mood) { 
          const response = await api.post('/mood', { 
              mood: data.mood, 
              source: 'face', 
              notes: data.notes || 'Face Analysis' 
          });
          
          // 🏆 Backend se Gamification data nikalo
          const { gamification } = response.data;
          
          // 🏆 Rewards Check Karo
          if (gamification) {
            checkForBadges(gamification);
          }
          
          toast.success("Mood Saved Successfully!");
      }
    } catch (error) {
      console.error("Mood Save Error:", error);
    }
  };

  // 🏆 Gamification & Rewards Handler
  const checkForBadges = (gamificationData) => {
    if (!gamificationData) return;

    // 1. Show Streak/Points Toast
    if (gamificationData.points > 0 || gamificationData.streak > 0) {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1e1e1e] shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-white/10 border border-yellow-500/20`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                 <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                   <Zap className="text-yellow-500" size={20} fill="currentColor"/>
                 </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">Mood Streak Updated!</p>
                <p className="mt-1 text-sm text-gray-400">
                  Current Streak: <span className="text-yellow-400 font-bold">{gamificationData.streak} Days</span> 🔥
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Points: {gamificationData.points}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 4000 });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0 animate-fadeIn relative">
      
      {/* Badge Overlay Animation */}
      <AnimatePresence>
        {earnedBadge && (
           <motion.div 
             initial={{ scale: 0, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0, opacity: 0 }}
             className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
           >
             <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-full shadow-[0_0_50px_rgba(251,191,36,0.5)] flex flex-col items-center">
               <Award size={64} className="text-white mb-2" />
               <span className="text-white font-bold text-lg">New Badge!</span>
             </div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="text-center space-y-2 pt-2 sm:pt-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">How are you feeling?</h2>
        <p className="text-sm sm:text-base text-gray-400">Choose a method to tell us about your day.</p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 glass-card rounded-2xl border border-white/10 overflow-x-auto hide-scrollbar">
        {['text', 'voice', 'face'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 min-w-[100px] sm:min-w-0 ${
              activeTab === tab 
                ? 'text-white border border-blue-500/20 bg-blue-500/10' 
                : 'text-gray-400 hover:text-white hover:bg-white/10 hover:border hover:border-white/20'
            }`}
          >
            {tab === 'text' && <Type size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {tab === 'voice' && <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {tab === 'face' && <Camera size={16} className="sm:w-[18px] sm:h-[18px]" />}
            <span className="capitalize">{tab} <span className="hidden sm:inline">Analysis</span></span>
          </button>
        ))}
      </div>

      {/* Analysis Components Container */}
      <div className="glass-card p-4 sm:p-8 rounded-2xl sm:rounded-3xl min-h-[250px] sm:min-h-[300px] flex flex-col justify-center relative overflow-hidden border border-white/10 transition-all">
        {activeTab === 'text' && <TextAnalysis onResult={handleAnalysisComplete} />}
        {activeTab === 'voice' && <VoiceAnalysis onResult={handleAnalysisComplete} />}
        {activeTab === 'face' && <FaceAnalysis onResult={handleAnalysisComplete} />}
      </div>

      {/* Result Card */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 sm:p-6 rounded-2xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-transparent"
        >
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl text-green-400 shadow-lg shadow-green-500/10 w-fit">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center flex-wrap gap-2">
                Mood Detected: <span className="capitalize text-green-400 text-xl">{result.mood}</span>
              </h3>
              {result.score && <p className="text-gray-300 mt-1 text-sm">Sentiment Score: {result.score}</p>}
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                "Great! We have logged this to your history. Visit the Suggestions page to find movies and music that match your vibe."
              </p>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default MoodLogger;