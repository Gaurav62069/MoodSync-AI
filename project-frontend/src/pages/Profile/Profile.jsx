import React, { useState, useEffect, useRef } from 'react';
import api, { spotifyApi } from '../../services/api'; // ✅ Spotify API Import
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, Mail, Save, Edit2, Trash2, 
  Award, Flame, Trophy, Loader2, Camera, 
  Lock, CheckCircle, AlertTriangle, Music 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout } = useAuth(); // ✅ User from context
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // --- Form & Image State ---
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const fileInputRef = useRef(null); 

  // --- 🛠️ HELPER: Sahi Image URL ---
  const getProfileImage = (userToCheck) => {
    if (imagePreview && isEditing) return imagePreview;
    if (userToCheck?.profilePicture && userToCheck.profilePicture !== 'default-avatar.png') {
      return userToCheck.profilePicture;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${userToCheck?.username || 'User'}&backgroundColor=b6e3f4`;
  };

  // --- 1. Fetch Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfile(data);
        setFormData({ username: data.username, email: data.email, password: '' });
        setImagePreview(null); 
      } catch (error) {
        console.error("Profile fetch error", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // --- 🎵 Spotify Connect Handler (NEW) ---
  const handleConnectSpotify = async () => {
  try {
    const result = await spotifyApi.getAuthUrl();

    console.log("✅ FINAL URL:", result.url);

    window.location.href=result.url; // replace > href
  } catch (error) {
    console.error(error);
    toast.error("Spotify connect failed");
  }
};




  // --- Image Selection Handler ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // --- Resend Verification Link ---
  const handleResendVerification = async () => {
    const toastId = toast.loading("Sending verification email...");
    try {
      await api.post('/auth/resend-verification');
      toast.success("Verification link sent! Check your inbox.", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send link.", { id: toastId });
    }
  };

  // --- Update Profile ---
  const handleUpdate = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
        toast.error("Username/Email cannot be empty");
        return;
    }

    try {
      const dataToSend = new FormData();
      dataToSend.append('username', formData.username.trim());
      dataToSend.append('email', formData.email.trim());
      if (formData.password.trim()) dataToSend.append('password', formData.password);
      if (selectedImage) dataToSend.append('profilePicture', selectedImage);

      const { data } = await api.patch('/users/profile', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setProfile(data);
      setIsEditing(false);
      setImagePreview(null);
      setFormData(prev => ({ ...prev, password: '' }));
      toast.success(data.message || "Profile updated successfully!");
      
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile.");
    }
  };

  // --- Delete Account ---
  const confirmDelete = async () => {
    const toastId = toast.loading("Deleting account...");
    try {
      await api.delete('/users/profile');
      toast.success("Account deleted.", { id: toastId });
      logout(); 
    } catch (error) {
      toast.error("Failed to delete account.", { id: toastId });
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center pt-20">
        <Loader2 className="animate-spin text-neon-blue w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-10">
      
      {/* --- HEADER CARD (Glass Effect Preserved) --- */}
      <div className="glass-card p-8 rounded-3xl flex flex-col md:flex-row items-start gap-8 border border-white/10 relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* Avatar */}
        <div className="relative group mx-auto md:mx-0">
          <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 p-1 overflow-hidden relative bg-gray-800 shadow-xl">
             <img 
                src={getProfileImage(profile)} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`;
                }}
             />
             {isEditing && (
               <div 
                 onClick={() => fileInputRef.current.click()}
                 className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
               >
                 <Camera className="text-white w-8 h-8" />
               </div>
             )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-[#0f172a] shadow-sm"></div>
        </div>

        {/* User Info / Edit Form */}
        <div className="flex-1 w-full space-y-4">
          {isEditing ? (
            <div className="space-y-4 max-w-md mx-auto md:mx-0 bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">Full Name</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Username" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">Email Address</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Email" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 ml-1">New Password (Optional)</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" placeholder="Leave blank to keep current" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleUpdate} className="bg-green-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-500 transition-colors text-white shadow-lg shadow-green-500/20"><Save size={14} /> Save</button>
                <button onClick={() => { setIsEditing(false); setFormData({ username: profile.username, email: profile.email, password: '' }); setImagePreview(null); setSelectedImage(null); }} className="bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/20 transition-colors text-white">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white tracking-tight mb-1">{profile?.username}</h2>
              <div className="flex items-center justify-center md:justify-start gap-3 text-sm mb-4 flex-wrap">
                <p className="text-gray-400 flex items-center gap-2"><Mail size={16} /> {profile?.email}</p>
                {profile?.emailVerified ? (
                  <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-500/30 flex items-center gap-1"><CheckCircle size={10} /> Verified</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/30 flex items-center gap-1 animate-pulse"><AlertTriangle size={10} /> Unverified</span>
                    <button onClick={handleResendVerification} className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer font-medium">Resend Link</button>
                  </div>
                )}
              </div>
              <button onClick={() => setIsEditing(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto md:mx-0 transition-colors font-medium bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20"><Edit2 size={14} /> Edit Profile</button>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="hidden md:flex gap-8 items-center border-l border-white/10 pl-8">
              <div className="text-center">
                  <p className="text-3xl font-bold text-orange-400 drop-shadow-sm">{profile?.moodLogStreak || 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Day Streak</p>
              </div>
              <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400 drop-shadow-sm">{profile?.points || 0}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Points</p>
              </div>
          </div>
        )}
      </div>

      {/* --- GAMIFICATION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" /> Your Progress</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors cursor-default">
                    <div className="flex items-center gap-3"><div className="p-2 bg-orange-500/20 rounded-xl text-orange-400"><Flame size={20} /></div><div><p className="font-bold text-white text-sm">Current Streak</p><p className="text-xs text-gray-400">Keep logging daily!</p></div></div>
                    <span className="text-xl font-bold text-white">{profile?.moodLogStreak || 0} 🔥</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3"><div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400"><Award size={20} /></div><div><p className="font-bold text-white text-sm">Total Points</p><p className="text-xs text-gray-400">Earned from activities</p></div></div>
                    <span className="text-xl font-bold text-white">{profile?.points || 0} 💎</span>
                </div>
            </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Award className="text-purple-500" /> Earned Badges</h3>
            {profile?.badges && profile.badges.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {profile.badges.map((badge, index) => (
                        <motion.div whileHover={{ scale: 1.05 }} key={index} className="flex flex-col items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" title={badge}>
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-2 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white font-bold text-lg border-2 border-white/20">
                                {badge.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[10px] text-center text-gray-300 font-medium uppercase tracking-wide w-full truncate">{badge.replace(/-/g, ' ')}</p>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-black/20 rounded-2xl border border-white/5 border-dashed flex flex-col items-center justify-center h-48">
                    <div className="bg-white/5 p-4 rounded-full mb-3"><Award size={32} className="text-gray-600" /></div>
                    <p className="text-gray-400 font-medium text-sm">No badges yet.</p>
                    <p className="text-xs text-gray-500 mt-1">Start logging your mood to earn rewards!</p>
                </div>
            )}
        </div>
      </div>

      {/* --- 🎵 INTEGRATIONS SECTION (NEW & THEMED) --- */}
      <div className="glass-card p-6 rounded-3xl border border-white/5">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Music className="text-green-500" /> Connected Apps
          </h3>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" 
                alt="Spotify" 
                className="w-10 h-10 drop-shadow-md"
              />
              <div>
                <h4 className="font-semibold text-white">Spotify</h4>
                <p className="text-xs text-gray-400">Connect for full song playback & personalized podcasts.</p>
              </div>
            </div>

            {profile?.spotifyConnected ? ( 
              <div className="flex items-center gap-2 text-green-400 font-medium bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 shadow-lg shadow-green-500/10">
                <CheckCircle size={16} /> <span>Connected</span>
              </div>
            ) : (
              <button 
                onClick={handleConnectSpotify}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-6 rounded-full transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 flex items-center gap-2"
              >
                Connect Premium
              </button>
            )}
          </div>
      </div>

      {/* --- DANGER ZONE --- */}
      <div className="glass-bg p-6 rounded-3xl border border-red-500/20 bg-red-500/5 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-red-400 mb-1 flex items-center justify-center md:justify-start gap-2"><Trash2 size={18} /> Danger Zone</h3>
                <p className="text-sm text-gray-400 max-w-md">Deleting your account is permanent. All data will be lost.</p>
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 px-6 py-3 rounded-xl font-semibold transition-all text-sm whitespace-nowrap shadow-lg shadow-red-500/5 hover:shadow-red-500/20">Delete Account</button>
        </div>
      </div>

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card border border-red-500/30 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform scale-100 animate-enter">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Delete Account?</h3>
              <p className="text-gray-400 text-sm">Action cannot be undone.</p>
            </div>
            <div className="flex border-t border-white/10">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-6 py-4 text-gray-300 font-medium hover:bg-white/5 border-r border-white/10">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-4 text-red-500 font-bold hover:bg-red-500/10">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;