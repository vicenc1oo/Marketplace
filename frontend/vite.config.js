import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config. The dev server proxies are intentionally omitted: the app talks
// to the backend through the absolute URL in VITE_API_URL so the same build
// works in Docker and locally without code changes.

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
