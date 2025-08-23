import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8080, // same port as your start command
    host: '0.0.0.0',
    allowedHosts: ['glorious-upliftment-production-3c02.up.railway.app']
  }
})
