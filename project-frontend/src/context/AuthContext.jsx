import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in (Page Refresh par)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Token hai toh profile fetch karo
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (error) {
          console.error("Token invalid:", error);
          localStorage.removeItem('authToken'); // Invalid token hata do
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // 2. Login Function (Email/Password)
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('authToken', data.token); // Token save karo
      setUser(data); // User state set karo
      toast.success(`Welcome back, ${data.username}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login Failed');
      return false;
    }
  };

  // 3. Register Function
  const register = async (username, email, password, country) => {
    try {
      await api.post('/auth/register', { username, email, password, country });
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration Failed');
      return false;
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    toast.success('Logged out successfully');
    window.location.href = '/login'; // Force redirect to login
  };

  // 5. NEW: Google Login Handler (Token Save & Redirect)
  const loginWithToken = (token) => {
    localStorage.setItem('authToken', token);
    // Page reload karke home par bhej do, taaki 'useEffect' chal jaye aur user data fetch ho jaye
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loginWithToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};