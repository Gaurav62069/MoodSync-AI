import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import SpotifyCallback from "./pages/Auth/SpotifyCallback";
// --- Pages Imports ---
import Dashboard from "./pages/Dashboard/Dashboard";
import Suggestions from "./pages/Suggestions/Suggestions";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Journal from "./pages/Journal/Journal";
import MoodLogger from "./pages/Mood/MoodLogger";
import Profile from "./pages/Profile/Profile";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Chatbot from "./pages/AI/Chatbot";
import ActivityHistory from "./pages/History/ActivityHistory";
import GoogleAuthSuccess from "./pages/Auth/GoogleAuthSuccess";
import ResetPassword from "./pages/Auth/ResetPassword";
import Preferences from "./pages/Profile/Preferences";
import AdminDashboard from "./pages/Admin/AdminDashboard";
// --- Context & Services ---
// Note: AuthProvider & ThemeProvider are removed from here (handled in main.jsx)
import { useAuth } from "./context/AuthContext";
import { requestForToken, onMessageListener } from "./config/firebase";
import api from "./services/api";
import MediaModal from './components/UI/MediaModal'; 
import { usePlayer } from './context/PlayerContext'; 

// --- Token Handler Component ---
// This handles push notification logic in the background
const NotificationHandler = () => {
  const { user } = useAuth(); // Connects to the AuthProvider in main.jsx

  useEffect(() => {
    if (user) {
      // 1. Request Permission & Get Token
      requestForToken().then(async (token) => {
        if (token) {
          try {
            // 2. Send Token to Backend
            await api.post("/users/register-push", { token });
            console.log("✅ Push Token Registered with Backend");
          } catch (error) {
            console.error("❌ Token Register Error:", error);
          }
        }
      });

      // 3. Listen for Foreground Messages
      onMessageListener()
        .then((payload) => {
          toast(payload.notification.title + ": " + payload.notification.body, {
            icon: "🔔",
            style: {
              background: "#333",
              color: "#fff",
            },
          });
        })
        .catch((err) => console.log("failed: ", err));
    }
  }, [user]);

  return null; // This component renders nothing visual
};
const GlobalPlayer = () => {
  const { currentMedia, closeMedia } = usePlayer();
  
  if (!currentMedia) return null;

  return (
    <MediaModal 
      item={currentMedia} 
      onClose={closeMedia} 
    />
  );
};
function App() {
  return (
    <Router>
      {/* --- Global Notification Toaster (Glass Theme) --- */}
      <Toaster
        position="top-center" // Or 'bottom-right' based on preference
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          // Glassmorphism Base Styles
          style: {
            background: "transparent", // Dark Slate Glass
            color: "#fff",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          },
          // Success Toast Specifics
          success: {
            iconTheme: {
              primary: "#10B981", // Emerald
              secondary: "white",
            },
            style: {
              border: "1px solid rgba(16, 185, 129, 0.3)",
            },
          },
          // Error Toast Specifics
          error: {
            iconTheme: {
              primary: "#EF4444", // Red
              secondary: "white",
            },
            style: {
              border: "1px solid rgba(239, 68, 68, 0.3)",
            },
          },
        }}
      />

      {/* Logic for Notifications */}
      <NotificationHandler />
        <GlobalPlayer />
      <Routes>
        {/* --- PROTECTED ROUTES (Requires Login) --- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood"
          element={
            <ProtectedRoute>
              <Layout>
                <MoodLogger />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/journal"
          element={
            <ProtectedRoute>
              <Layout>
                <Journal />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivityHistory />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Layout>
                <Chatbot />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Layout>
                <Preferences />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* --- SEMI-PUBLIC ROUTES (Layout Needed) --- */}
        <Route
          path="/suggestions"
          element={
            <Layout>
              <Suggestions />
            </Layout>
          }
        />
        <Route
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'owner']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* --- AUTH ROUTES (Full Screen) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* Google Auth Callback */}
        <Route path="/google-auth-success" element={<GoogleAuthSuccess />} />
        <Route path="/spotify-callback" element={<SpotifyCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
