import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Music, Video, Globe, Film, Mic, Plus, X, Sparkles, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

// --- 1. LOCAL DATA (For Languages & Genres - Browser Search) ---
const LOCAL_DATA = {
  languages: [
    "Hindi", "English", "Punjabi", "Bhojpuri", "Tamil", "Telugu", "Malayalam", 
    "Kannada", "Marathi", "Bengali", "Gujarati", "Haryanvi", "Urdu", "Odia", 
    "Assamese", "Rajasthani", "Spanish", "Korean", "Japanese", "French"
  ],
  musicGenres: [
    "Bollywood", "Punjabi Pop", "Indie India", "Lofi", "Hip Hop", "Rap", "Rock", 
    "Classical", "Sufi", "Ghazal", "EDM", "Workout", "Party", "Devotional", 
    "Bhajan", "K-Pop", "Jazz", "Metal", "Acoustic", "Romance", "Sad Songs"
  ],
  movieGenres: [
    "Action", "Comedy", "Sci-Fi", "Horror", "Romance", "Thriller", "Drama", 
    "Documentary", "Anime", "Mystery", "Crime", "Adventure", "Fantasy", 
    "Supernatural", "Biography", "Family", "Musical", "War", "Western"
  ]
};

// --- 2. POPULAR SUGGESTIONS (Quick Pills) ---
const POPULAR = {
    artists: ["Arijit Singh", "Diljit Dosanjh", "The Weeknd", "Sidhu Moose Wala", "A.R. Rahman", "Badshah", "Atif Aslam", "Taylor Swift", "King", "Divine"],
    creators: ["Samay Raina", "CarryMinati", "Tanmay Bhat", "Dhruv Rathee", "MrBeast", "BB Ki Vines", "Sandeep Maheshwari", "Triggered Insaan", "Techno Gamerz"],
};

// --- 🔥 SMART HYBRID INPUT COMPONENT ---
const DynamicSection = ({ title, icon: Icon, selected, onUpdate, placeholder, searchType, localOptions, defaultOptions }) => {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Agar input khali h, to dropdown band karo
    if (inputValue.length < 1) {
        setResults([]);
        setShowDropdown(false);
        return;
    }

    const timer = setTimeout(async () => {
        setIsSearching(true);
        
        // CASE 1: API SEARCH (Artist / Creator)
        if (searchType) {
            try {
                const { data } = await api.get(`/content/live-search?query=${inputValue}&type=${searchType}`);
                setResults(data);
                setShowDropdown(true);
            } catch (err) {
                console.error("API Search failed", err);
            }
        } 
        // CASE 2: LOCAL SEARCH (Language / Genres)
        else if (localOptions) {
            const filtered = localOptions.filter(item => 
                item.toLowerCase().includes(inputValue.toLowerCase()) && 
                !selected.includes(item)
            ).map(item => ({ name: item, sub: 'Select' }));
            
            setResults(filtered);
            setShowDropdown(true);
        }

        setIsSearching(false);
    }, 300); // Debounce delay

    return () => clearTimeout(timer);
  }, [inputValue, searchType, localOptions, selected]);

  const addValue = (val) => {
    if (!val) return;
    if (selected.includes(val)) {
        toast.error(`${val} pehle se added hai!`);
    } else {
        onUpdate([...selected, val]);
        setInputValue("");
        setShowDropdown(false);
    }
  };

  const removeValue = (val) => {
    onUpdate(selected.filter(item => item !== val));
  };

  // 👇 Z-INDEX LOGIC: Agar dropdown khula hai, to is section ko sabse upar laao (z-50)
  const containerZIndex = showDropdown ? "z-50" : "z-10";

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 overflow-visible relative transition-all duration-200 ${containerZIndex}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      {/* Input Area */}
      <div className="relative mb-4"> 
        <div className="flex gap-2">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)} 
                    onFocus={() => inputValue.length >= 1 && setShowDropdown(true)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
                {isSearching && (
                    <div className="absolute right-3 top-2.5">
                        <Loader2 size={18} className="animate-spin text-blue-400" />
                    </div>
                )}
            </div>
            <button onClick={() => addValue(inputValue)} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-colors">
                <Plus size={24} />
            </button>
        </div>

        {/* 👇 FIX: Solid Background & High Z-Index for Dropdown */}
        <AnimatePresence>
            {showDropdown && results.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#0f0f0f] border border-gray-700 rounded-xl shadow-2xl z-[100] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
                >
                    {results.map((item, index) => (
                        <div key={index} onClick={() => addValue(item.name)} className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><Sparkles size={14} className="text-gray-400" /></div>
                            )}
                            <div>
                                <p className="text-white font-medium text-sm">{item.name}</p>
                                <p className="text-gray-500 text-[10px] uppercase tracking-wider">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selected.map((item) => (
             <span key={item} className="px-3 py-1 rounded-full bg-blue-600/20 border border-blue-500/50 text-blue-200 text-sm flex items-center gap-2">
                {item}
                <button onClick={() => removeValue(item)} className="hover:text-white"><X size={14} /></button>
             </span>
        ))}
      </div>

      {/* Popular Suggestions (Quick Pills) */}
      {defaultOptions && defaultOptions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Popular Suggestions:</p>
            <div className="flex flex-wrap gap-2">
                {defaultOptions.map((option) => {
                    if (selected.includes(option)) return null; 
                    return (
                        <button
                            key={option}
                            onClick={() => addValue(option)}
                            className="px-3 py-1 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-1 group"
                        >
                            <Plus size={10} className="group-hover:text-blue-400 transition-colors" /> {option}
                        </button>
                    );
                })}
            </div>
          </div>
      )}

    </div>
  );
};

// --- MAIN PAGE ---
const Preferences = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    languages: [],
    favoriteArtists: [],
    favoriteCreators: [],
    musicGenres: [],
    movieGenres: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        if (data.preferences) setFormData(prev => ({ ...prev, ...data.preferences }));
      } catch (error) {
        toast.error("Could not load preferences");
      }
    };
    fetchProfile();
  }, []);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile', { preferences: formData });
      toast.success('Preferences Updated!');
      setTimeout(() => navigate('/suggestions'), 1500);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fadeIn px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 pt-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
             <Sparkles className="text-yellow-400" /> Personalization
          </h1>
          <p className="text-gray-400 mt-1">Search or pick what you love for better recommendations.</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
          {loading ? 'Saving...' : 'Save Preferences'}
          {!loading && <Save size={18} />}
        </button>
      </div>

      <div className="space-y-2">
        {/* Languages */}
        <DynamicSection 
          title="Languages" icon={Globe} 
          placeholder="Search language..." 
          localOptions={LOCAL_DATA.languages} 
          defaultOptions={LOCAL_DATA.languages.slice(0, 8)} 
          selected={formData.languages} 
          onUpdate={(val) => updateField('languages', val)} 
        />

        {/* Artists (API Search) */}
        <DynamicSection 
          title="Favorite Artists" icon={Mic} 
          placeholder="Search Spotify artist..." 
          searchType="artist" 
          defaultOptions={POPULAR.artists} 
          selected={formData.favoriteArtists} 
          onUpdate={(val) => updateField('favoriteArtists', val)} 
        />

        {/* Creators (API Search) */}
        <DynamicSection 
          title="Favorite Creators" icon={Video} 
          placeholder="Search YouTuber..." 
          searchType="creator" 
          defaultOptions={POPULAR.creators} 
          selected={formData.favoriteCreators} 
          onUpdate={(val) => updateField('favoriteCreators', val)} 
        />

        {/* Music Genres */}
        <DynamicSection 
          title="Music Genres" icon={Music} 
          placeholder="Search genre..." 
          localOptions={LOCAL_DATA.musicGenres} 
          defaultOptions={LOCAL_DATA.musicGenres.slice(0, 10)} 
          selected={formData.musicGenres} 
          onUpdate={(val) => updateField('musicGenres', val)} 
        />

        {/* Movie Genres */}
        <DynamicSection 
          title="Movie Genres" icon={Film} 
          placeholder="Search genre..." 
          localOptions={LOCAL_DATA.movieGenres} 
          defaultOptions={LOCAL_DATA.movieGenres.slice(0, 8)} 
          selected={formData.movieGenres} 
          onUpdate={(val) => updateField('movieGenres', val)} 
        />
      </div>
    </div>
  );
};

export default Preferences;