import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { PlayerProvider } from './context/PlayerContext';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
      <PlayerProvider> 
           <App />
        </PlayerProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>
);
