import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ label, type, icon: Icon, className = '', ...props }) => {
  // 1. Password visibility ka state manage karne ke liye
  const [showPassword, setShowPassword] = useState(false);

  // 2. Check karo ki kya ye password field hai?
  const isPasswordField = type === 'password';

  // 3. Agar password field hai, toh state ke hisaab se type badlo (text vs password)
  const inputType = isPasswordField 
    ? (showPassword ? 'text' : 'password') 
    : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      
      {/* Label (Optional) */}
      {label && (
        <label className="text-gray-300 text-sm font-medium ml-1 block">
          {label}
        </label>
      )}

      <div className="relative">
        
        {/* Left Icon (Agar pass kiya gaya ho, jaise Mail icon) */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        {/* Main Input Field */}
        <input
          type={inputType}
          className={`
            w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white placeholder-gray-500
            focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all
            ${Icon ? 'pl-12' : 'pl-4'} 
            ${isPasswordField ? 'pr-12' : 'pr-4'} 
          `}
          {...props}
        />

        {/* Right Icon (Sirf Password fields ke liye) */}
        {isPasswordField && (
          <button
            type="button" // Important: Taaki form submit na ho jaye
            onClick={togglePasswordVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? (
              <EyeOff size={20} /> // Password Hidden Icon
            ) : (
              <Eye size={20} /> // Password Visible Icon
            )}
          </button>
        )}

      </div>
    </div>
  );
};

export default Input;