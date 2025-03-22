import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),   tailwindcss()],
  // server: {
  //   host: true, 
  //   port: 5173, 
  //   strictPort: true, 
  //   allowedHosts: [
  //     "localhost",
  //     "9e88-117-250-161-222.ngrok-free.app"
  //   ]
  // }
})
