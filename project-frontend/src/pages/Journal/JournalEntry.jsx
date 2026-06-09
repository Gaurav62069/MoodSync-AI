import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const JournalEntry = ({ entry, onDelete }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="glass-bg p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-white">{entry.title}</h3>
        
        <div className="flex items-center gap-4">
          {/* Date Badge */}
          <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-lg">
            <Calendar size={12} />
            {new Date(entry.createdAt).toLocaleDateString()}
          </div>

          {/* Delete Button */}
          <button 
            onClick={() => onDelete(entry._id)}
            className="text-gray-500 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
        {entry.content}
      </p>
    </motion.div>
  );
};

export default JournalEntry;