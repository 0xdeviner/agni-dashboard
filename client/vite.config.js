import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Dev requests to '/api/*' go to backend at 3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    // If an overlay blocks clicks while you debug, you can temporarily disable it:
    // hmr: { overlay: false }
  },
  build: {
    outDir: 'dist'
  }
});