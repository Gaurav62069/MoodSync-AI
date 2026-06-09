import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Loader2, BookOpen, X } from 'lucide-react';

// Components Import
import JournalForm from './JournalForm';
import JournalEntry from './JournalEntry';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // --- Fetch Data ---
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await api.get('/journal');
setEntries(Array.isArray(data.data) ? data.data : []);

    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load journal entries.");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleCreate = async (formData) => {
    try {
      const { data } = await api.post('/journal', formData);
      setEntries(prev => [data.data, ...prev]);

      setShowForm(false); // Close form
      toast.success("Journal entry added!");
    } catch (error) {
      toast.error("Failed to save entry.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/journal/${id}`);
      setEntries(entries.filter((entry) => entry._id !== id));
      toast.success("Entry deleted.");
    } catch (error) {
      toast.error("Failed to delete entry.");
    }
  };

  return (
    <div className=" max-w-4xl mx-auto space-y-6 animate-fadeIn relative min-h-[80vh]">
      
      {/* --- Header Section --- */}
      <div className="flex justify-between items-end pb-4 border-b border-white/5 lg:border-none">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">My Journal</h2>
          <p className="text-gray-400 mt-1 text-sm lg:text-base">Capture your thoughts and memories.</p>
        </div>
        
        {/* --- 1. DESKTOP BUTTON (Hidden on Mobile) --- */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className="hidden md:flex bg-blue-600/5 hover:bg-blue-500/5 border-blue-500 text-blue-400 hover:text-blue-500 px-5 py-2.5 rounded-xl font-semibold items-center gap-2 transition-all  active:scale-95 border"
        >
            
          {showForm ? 'Cancel' : <><Plus size={20} /> New Entry</>}
        </button>
      </div>

      {/* --- 2. MOBILE FLOATING ACTION BUTTON (FAB) --- */}
      {/* Fixed position, Gradient, Glow Effect */}
      <button
        onClick={() => setShowForm(!showForm)}
        className={`
            md:hidden fixed bottom-24 right-6 z-40 
            w-14 h-14 rounded-full 
            flex items-center justify-center 
            border
            transition-all duration-300 active:scale-90
            ${showForm ? 'bg-red-500/5 border-red-500 rotate-90' : 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 border-blue-400  '}
        `}
      >
        {showForm ? <X size={28} className="text-red-500 hover:text-red-400" /> : <Plus size={28} className="text-blue-400 hover:text-blue-500" />}
      </button>

      {/* Form Component (Smooth Expand) */}
      <div className={`transition-all duration-300 overflow-hidden ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 h-0'}`}>
        {showForm && <JournalForm show={showForm} onSubmit={handleCreate} />}
      </div>

      {/* List Section */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="text-blue-500 animate-spin w-10 h-10" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 opacity-50">
          <BookOpen size={60} className="mx-auto mb-4 text-gray-500" />
          <p className="text-xl text-gray-300">Your journal is empty.</p>
          <p className="text-gray-500">Start writing your first memory today.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 pb-20 md:pb-0">
         {Array.isArray(entries) && entries.map((entry) => (
            <JournalEntry 
              key={entry._id} 
              entry={entry} 
              onDelete={handleDelete} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;