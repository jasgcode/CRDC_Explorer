// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // host: true,
    // port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',   //http://backend:5001 put this if using docker container
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    }
  }
})