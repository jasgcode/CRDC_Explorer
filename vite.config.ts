// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // comment these out for vite dev
    port: 5173, // comment these out for vite dev 
    proxy: {
      '/api': {
        target: 'http://backend:5001',   //http://backend:5001 put this if using docker container http://localhost:5001 if vite
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      }
    }
  }
})