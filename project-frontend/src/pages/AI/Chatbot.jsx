import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { Send, Bot, User, Loader2, Sparkles, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Theme update ke liye

// --- MOOD EMOJI MAP ---
const MOOD_EMOJIS = {
  happy: '🎉',
  excited: '🤩',
  sad: '😢',
  angry: '😡',
  stressed: '🤯',
  calm: '😌',
  bored: '😐',
  neutral: '🙂',
  anxious: '😰'
};

// --- REACTION COMPONENT (Popup Animation) ---
const MoodReaction = ({ mood, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // 3 sec baad khud band ho jayega
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="absolute inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
    >
      <div className="text-center">
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-9xl mb-4 filter drop-shadow-lg"
        >
          {MOOD_EMOJIS[mood] || '✨'}
        </motion.div>
        <h2 className="text-2xl font-bold text-white">Mood Detected: <span className="capitalize text-yellow-400">{mood}</span></h2>
        <p className="text-gray-300 mt-2 text-sm">Adjusting your dashboard theme...</p>
      </div>
    </motion.div>
  );
};

const Chatbot = () => {
  const { user } = useAuth();
  const { setCurrentTheme } = useTheme(); // Theme setter
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectedMood, setDetectedMood] = useState(null); // For animation

  // Initial State from LocalStorage
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('chatHistory');
    return savedChat ? JSON.parse(savedChat) : [
      { 
        role: 'assistant', 
        content: `Hi ${user?.username || 'Friend'}! I'm your AI Wellness Coach. How are you feeling today?` 
      }
    ];
  });
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages, loading]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
    
  }, [messages]);

  

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const apiHistory = newHistory.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const contextPayload = {
        message: userMsg.content,
        history: [
          { role: 'system', content: `User's name is ${user?.username || 'Unknown'}. Be helpful and kind.` },
          ...apiHistory
        ]
      };

      const { data } = await api.post('/ai/chat', contextPayload);
      
      const aiMsg = { 
        role: 'assistant', 
        content: data.reply
      };
      
      setMessages(prev => [...prev, aiMsg]);
      
      // --- VISUAL REACTION LOGIC ---

    } catch (error) {
      console.error(error);
      toast.error("AI connection failed.");
    } finally {
      setLoading(false);
    }
  };
const endChatAndDetectMood = async (chatMessages = messages) => {
  try {
    const conversationText = chatMessages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    if (!conversationText.trim()) return;

    const { data } = await api.post('/ai/chat/end', {
      conversation: conversationText
    });

    if (data?.mood) {
      setDetectedMood(data.mood);
      setCurrentTheme(data.mood);
      toast.success(`Mood logged: ${data.mood}`, {
        icon: MOOD_EMOJIS[data.mood] || '✨'
      });
    }

  } catch (err) {
    console.error('End chat mood detection failed');
  }
};


  const clearChat = async () => {
    const snapshot = [...messages];
  await endChatAndDetectMood(snapshot);

  const initialMsg = [{
    role: 'assistant',
    content: `Memory wiped! Hi ${user?.username || ''}, let's start fresh.`
  }];

  setMessages(initialMsg);
  localStorage.removeItem('chatHistory');
  toast.success("Chat history cleared");
};


  return (
    <div className="max-w-3xl mx-auto h-[85vh] flex flex-col glass-bg rounded-3xl overflow-hidden animate-fadeIn border border-white/10 relative">
      
      {/* --- MOOD ANIMATION OVERLAY --- */}
      <AnimatePresence>
        {detectedMood && (
          <MoodReaction mood={detectedMood} onClose={() => setDetectedMood(null)} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg"><Bot className="text-purple-400" /></div>
            <div>
                <h3 className="font-bold text-white">MoodSync AI</h3>
                <p className="text-[10px] text-green-400 flex items-center gap-1 uppercase tracking-wider font-bold">● Online</p>
            </div>
        </div>
        <button onClick={clearChat} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-red-400 transition-colors" title="Clear Chat">
            <Trash2 size={18} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gradient-to-b from-transparent to-black/20">
        <AnimatePresence>
            {messages.map((msg, index) => (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                }`}>
                {msg.content}
                </div>
            </motion.div>
            ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex gap-2 items-center border border-white/5">
                <Sparkles size={14} className="text-purple-400 animate-pulse" />
                <span className="text-xs text-gray-400">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Chat with ${user?.username || 'AI'}...`}
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 placeholder-gray-500 transition-all"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl text-white hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50 transition-all active:scale-95"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;