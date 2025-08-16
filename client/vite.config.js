import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy to backend (avoids CORS)
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // listen on 0.0.0.0
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
      '/auth': 'http://localhost:4000',
      '/docs': 'http://localhost:4000',
      '/docs.json': 'http://localhost:4000',
      '/health': 'http://localhost:4000'
    }
  }
});