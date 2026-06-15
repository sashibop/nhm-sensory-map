import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Intercept any request starting with /api/v1
      '/api/v1': {
        target: 'https://ki-toolbox.scc.kit.edu', // The KIT API [cite: 45]
        changeOrigin: true, // This bypasses CORS!
        secure: false,
      }
    }
  }
})