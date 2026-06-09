import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JournalForm = ({ show, onSubmit }) => {
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setSubmitting(true);
    await onSubmit(formData); // Parent ko data bhejo
    setSubmitting(false);
    setFormData({ title: '', content: '' }); // Reset form
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.form 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          onSubmit={handleSubmit}
          className="glass-card p-6 rounded-2xl border border-white/10 overflow-hidden mt-8 transition-all"
        >
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Title (e.g., A day well spent...)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              required
            />
            <textarea 
              placeholder="Write your thoughts here..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full h-32 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
              required
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600/5 to-purple-600/5 px-6 py-2.5 rounded-xl font-bold text-white/60 shadow-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2 border border-blue-500/20"
              >
                
                {submitting && <Loader2 className="animate-spin" size={18} />}
                Save Note
              </button>
            </div>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default JournalForm;