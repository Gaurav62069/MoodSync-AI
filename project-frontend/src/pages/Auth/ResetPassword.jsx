import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'; // Eye icon hata diya yahan se
import api from '../../services/api';
import Input from '../../components/UI/Input';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Show/Hide password ka state hataya kyunki Input.jsx khud handle karega
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setStatus('loading');

    try {
      await api.patch(`/auth/reset-password/${token}`, {
        password: formData.password,
        passwordConfirm: formData.confirmPassword // Backend probably needs strictly 'password' but logic handles comparison
      });
      
      setStatus('success');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error) {
      console.error("Reset Error:", error);
      setStatus('error');
      setErrorMessage(
        error.response?.data?.message || 'Token expired or invalid.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-transparent">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>

      <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-3xl relative z-10 border border-white/10 shadow-2xl animate-fadeIn">

        {/* --- STATE: SUCCESS --- */}
        {status === 'success' ? (
          <div className="text-center py-6 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="text-green-400 w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Your password has been updated. Redirecting to login...
            </p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300">Go to Login Now</Link>
          </div>
        ) : (
          
          /* --- STATE: FORM --- */
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 mb-5 shadow-glow">
                <Lock className="text-white w-7 h-7" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Set New Password</h2>
              <p className="text-gray-400 mt-2 text-sm">Create a strong password.</p>
            </div>

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span> {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* ✅ Simplified Inputs: Eye icon ab Input.jsx khud lagayega */}
              <Input 
                label="New Password" 
                name="password"
                type="password" 
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input 
                label="Confirm Password" 
                name="confirmPassword"
                type="password" 
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-glow active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
              >
                {status === 'loading' ? 'Processing...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm hover:underline">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;