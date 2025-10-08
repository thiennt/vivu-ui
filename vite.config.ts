import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8080,
    open: true,
    allowedHosts: [
      // Add your ngrok hostname here
      "cf08dc480250.ngrok-free.app",
      // Optionally add other hosts if needed
      "localhost",
      "127.0.0.1",
    ],
  }
});