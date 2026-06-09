import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Input from '../../components/UI/Input';
import { KeyRound, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Backend call
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  return (
    // ✅ Main Container: Transparent taaki body ka Grid/Aurora theme dikhe
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-transparent">
      
      {/* --- Ambient Glow (Background Effect) --- */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-slow"></div>

      {/* ✅ Glass Card Container */}
      <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-3xl relative z-10 border border-white/10 shadow-2xl animate-fadeIn">

        {/* --- STATE 1: SUCCESS (Email Sent) --- */}
        {status === 'success' ? (
          <div className="text-center py-4 animate-fadeIn">
            {/* Success Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="text-green-400 w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Check your email</h2>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              We have sent a password reset link to <br />
              <span className="text-white font-medium bg-white/5 px-2 py-0.5 rounded">{email}</span>
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => window.open('https://gmail.com', '_blank')}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
              >
                <Mail size={18} className="group-hover:scale-110 transition-transform" /> 
                Open Email App
              </button>
              
              <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        ) : (
          
          /* --- STATE 2: FORM (Input Email) --- */
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              {/* Icon Container with Gradient */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-purple-500 mb-5 shadow-glow transform hover:scale-105 transition-transform duration-300">
                <KeyRound className="text-white w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Forgot Password?</h2>
              <p className="text-gray-400 mt-2 text-sm">
                No worries! Enter your email and we'll send you reset instructions.
              </p>
            </div>

            {/* Error Message Alert */}
            {status === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-center gap-2 animate-pulse">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-glow active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {status === 'loading' ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium hover:underline"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;