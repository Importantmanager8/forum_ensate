import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
   preview: {
    allowedHosts: [
      'https://glorious-upliftment-production-3c02.up.railway.app', 
    ],
  },
  base: './', 
})
