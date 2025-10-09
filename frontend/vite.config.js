import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),svgr()],
  server: {
    host: '0.0.0.0',
    port: "5173",
    allowedHosts: [
      '3c20dbbd52d0.ngrok-free.app',
      '192.168.100.243'
    ]
  }
})
