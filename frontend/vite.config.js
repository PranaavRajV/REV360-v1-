import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise warning threshold — Three.js is inherently large
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk: React + router
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Three.js ecosystem — separate chunk so it can be cached independently
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          // Recharts (analytics charts)
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
})
