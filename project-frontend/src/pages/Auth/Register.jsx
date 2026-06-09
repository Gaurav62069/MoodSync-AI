import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/UI/Input';
import { Zap, Globe, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    country: 'IN' 
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData.username, formData.email, formData.password, formData.country);
    if (success) navigate('/login');
  };

  return (
    // ✅ Main Container: Transparent taaki body ka Grid/Aurora theme dikhe
    <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative bg-transparent">
      
      {/* --- Ambient Background Glows (Optional enhancement) --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      {/* ✅ Glass Card Container */}
      <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-3xl relative z-10 border border-white/10 shadow-2xl animate-fadeIn">
        
        {/* Header Section */}
        <div className="text-center mb-8 relative">
          
          {/* Logo with Glow */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl mb-5 shadow-glow relative group">
            <Zap className="text-white w-7 h-7 relative z-10" fill="white" />
            
            {/* Hover Sparkle Effect */}
            <div className="absolute -top-2 -right-2 bg-white text-yellow-400 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
              <Sparkles size={12} fill="currentColor" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-gray-400 mt-2 text-sm">Start your wellness journey today.</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Full Name */}
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="e.g. Gaurav Kumar"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          
          {/* Email */}
          <Input 
            label="Email" 
            type="email" 
            placeholder="hello@example.com"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          {/* Country Dropdown (Custom Styled) */}
          <div className="space-y-2">
            <label className="text-gray-300 text-sm font-medium ml-1 flex items-center gap-2">
              <Globe size={14} className="text-blue-400" /> Select Country
            </label>
            <div className="relative group">
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer hover:bg-white/10 backdrop-blur-sm"
              >
                {/* Dark Background Options for readability */}
                <option value="IN" className="bg-[#050505] text-white">India 🇮🇳</option>
                <option value="US" className="bg-[#050505] text-white">United States 🇺🇸</option>
                <option value="GB" className="bg-[#050505] text-white">United Kingdom 🇬🇧</option>
                <option value="CA" className="bg-[#050505] text-white">Canada 🇨🇦</option>
                <option value="AU" className="bg-[#050505] text-white">Australia 🇦🇺</option>
                <option value="DE" className="bg-[#050505] text-white">Germany 🇩🇪</option>
                <option value="FR" className="bg-[#050505] text-white">France 🇫🇷</option>
                <option value="JP" className="bg-[#050505] text-white">Japan 🇯🇵</option>
              </select>
              
              {/* Custom Arrow Icon */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Password */}
          <Input 
            label="Password" 
            type="password" 
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          {/* Submit Button */}
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-glow mt-4 active:scale-[0.98] transform hover:-translate-y-0.5">
            Sign Up Free
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center mt-8 text-gray-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;