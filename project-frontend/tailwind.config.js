/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // --- 1. CYBER GRID COLOR PALETTE ---
      colors: {
        // Dynamic Mood Colors (Managed by ThemeContext)
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',

        // Dark Backgrounds (Deep Space for Grid)
        'surface-dark': '#050505', // Almost Pure Black
        'surface-glass': 'rgba(20, 20, 25, 0.7)', // Tinted Glass for Cards
        
        // Neon Accents (For Highlights)
        'neon-purple': '#d946ef',
        'neon-blue': '#3b82f6',
        'neon-cyan': '#06b6d4',
        'neon-green': '#22c55e',
      },

      // --- 2. ADVANCED SHADOWS ---
      boxShadow: {
        'glow': '0 0 20px -5px var(--primary-color)', // Soft Theme Glow
        'glow-strong': '0 0 30px rgba(139, 92, 246, 0.5)', 
        'glass-edge': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 10px 40px -10px rgba(0, 0, 0, 0.5)', // 3D Edge
      },

      // --- 3. TYPOGRAPHY ---
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      // --- 4. ANIMATIONS (GRID & UI) ---
      animation: {
        'grid-flow': 'gridFlow 20s linear infinite', // Grid moving effect
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Breathing light
        'float': 'float 6s ease-in-out infinite', // Floating cards
        'spin-slow': 'spin 12s linear infinite',
      },

      // --- 5. KEYFRAMES ---
      keyframes: {
        gridFlow: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '50px 50px' }, // Moves grid diagonally
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}