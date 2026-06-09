import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Film, Music, Video, Book, Loader2, Smile, Newspaper, CheckSquare, Mic, Play } from 'lucide-react';
import { motion } from 'framer-motion';
// 👇 1. Import MediaModal
import MediaModal from '../../components/UI/MediaModal';

const ActivityHistory = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 2. State for Modal
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/content-log');
        setLogs(data.history || []);
      } catch (error) {
        console.error("History fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'movie': return <Film className="text-blue-400" />;
      case 'song': return <Music className="text-green-400" />;
      case 'video': return <Video className="text-red-400" />;
      case 'book': return <Book className="text-yellow-400" />;
      case 'news': return <Newspaper className="text-purple-400" />;
      case 'joke': return <Smile className="text-pink-400" />;
      case 'task': return <CheckSquare className="text-orange-400" />;
      case 'podcast': return <Mic className="text-indigo-400" />;
      default: return <Clock className="text-gray-400" />;
    }
  };

  // 👇 3. Handle Click (Replay)
  const handleItemClick = (log) => {
    // Sirf Playable items ke liye modal kholo (Task/Joke ke liye nahi)
    if (['song', 'video', 'podcast', 'movie'].includes(log.type)) {
        setSelectedItem({
            ...log,
            // Backend log me shayad 'uri' na ho, lekin 'contentId' hota hai.
            // MediaModal 'contentId' se uri khud bana leta hai.
            uri: log.uri || (log.type === 'song' ? `spotify:track:${log.contentId}` : null) 
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-24 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-3xl font-bold text-white">Activity History</h2>
           <p className="text-gray-400 text-sm mt-1">Click on an item to play it again.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
            <Clock size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No activity yet.</p>
            <p className="text-sm text-gray-500 mt-2">Go to Suggestions and start exploring!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const isPlayable = ['song', 'video', 'podcast'].includes(log.type);
            
            return (
                <motion.div 
                key={log._id} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                onClick={() => handleItemClick(log)} // 👈 Click Event
                className={`glass-card p-4 rounded-2xl flex items-center gap-4 border border-white/5 transition-all group relative overflow-hidden
                    ${isPlayable ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 hover:scale-[1.01]' : ''}
                `}
                >
                {/* Icon Box */}
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors z-10">
                    {getIcon(log.type)}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0 z-10">
                    <h3 className="font-semibold text-white truncate pr-8">{log.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/5">
                            {log.type}
                        </span>
                        <span>•</span>
                        <span>
                            {new Date(log.createdAt).toLocaleDateString(undefined, {
                                day: 'numeric', month: 'short'
                            })}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">
                            {new Date(log.createdAt).toLocaleTimeString(undefined, {
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                </div>

                {/* Play Hover Overlay (Visual Feedback) */}
                {isPlayable && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 text-white">
                            <Play size={20} fill="currentColor" />
                        </div>
                    </>
                )}

                </motion.div>
            );
          })}
        </div>
      )}

      {/* 👇 4. Render Media Modal */}
      {selectedItem && (
        <MediaModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
        />
      )}

    </div>
  );
};

export default ActivityHistory;