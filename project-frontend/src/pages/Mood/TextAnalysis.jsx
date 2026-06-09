import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TextAnalysis = ({ onResult }) => {
  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setLoading(true);
    try {
      // 1. AI Analysis
      const response = await api.post('/ai/analyze-text', { text: textInput });

// 🔥 Backend response ke andar actual result hota hai
const moodResult = response.data.data;

// DB Log
await api.post('/mood', { 
  mood: moodResult.mood, 
  source: 'text', 
  notes: textInput 
});
      toast.success('Mood logged via Text!');
      setTextInput('');
      onResult(moodResult);
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze text.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="I am feeling slightly anxious about my exams tomorrow but hopeful..."
        className="w-full h-40 bg-black/20 border border-white/10 rounded-2xl p-5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all"
      />
      <div className="flex justify-end">
        <button 
          onClick={handleTextSubmit}
          disabled={loading || !textInput}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600/5 to-purple-600/5 px-6 py-3 rounded-xl font-bold text-gray-400  hover:scale-105 transition-transform disabled:opacity-50 border border-blue-500/20 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          Analyze Mood
        </button>
      </div>
    </motion.div>
  );
};

export default TextAnalysis;