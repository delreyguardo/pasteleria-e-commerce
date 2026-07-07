import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    // Warn if any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Function form required by Rolldown (Vite 8)
        manualChunks(id: string) {
          if (id.includes('firebase')) return 'vendor-firebase';
          if (id.includes('lucide')) return 'vendor-icons';
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
