import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Ensure you import the react plugin if you are using it!

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // ✅ CHANGED: Set to root '/' for Render deployment instead of '/LunaFlow/'
    base: "/",
    
    // Add the React plugin (Standard for Vite React apps)
    plugins: [react()],

    define: {
      // This maps the key from your .env.local (GEMINI_API_KEY)
      // to the global process.env.API_KEY variable used by the Gemini SDK.
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    server: {
      port: 5173,
      open: true,
    },
  };
});