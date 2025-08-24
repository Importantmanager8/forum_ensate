import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      port: 8080, // same port as your start command
      host: '0.0.0.0',
      allowedHosts: ['glorious-upliftment-production-3c02.up.railway.app']
    },
  },
  plugins: [react()],
  // Remove the optimizeDeps.exclude for lucide-react to fix module loading
});
