import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
   preview: {
    allowedHosts: [
      'glorious-upliftment-production-3c02.up.railway.app', // your Railway frontend domain
    ],
  },
  base: './', 
})
