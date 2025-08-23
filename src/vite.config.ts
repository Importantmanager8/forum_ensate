import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // forwards /api requests to backend
    },
  },
  plugins: [react()],
  // Remove the optimizeDeps.exclude for lucide-react to fix module loading
});
