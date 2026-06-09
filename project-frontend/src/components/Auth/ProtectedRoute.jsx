import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Apne context ka sahi path dekhein
import { Loader2 } from 'lucide-react';

// 👇 'allowedRoles' prop add kiya
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
console.log("👮 ProtectedRoute Check:", { 
    MyRole: user?.role, 
    Allowed: allowedRoles 
  });
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={40} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  // 1. Agar login nahi hai -> Login page par bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. 👇 NEW: Agar role match nahi karta -> Ghar bhejo (Home)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;