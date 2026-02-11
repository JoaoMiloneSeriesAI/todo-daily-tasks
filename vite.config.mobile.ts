import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/// <summary>
/// Vite configuration for mobile (Capacitor) builds.
/// Identical to the desktop config but WITHOUT vite-plugin-electron.
/// Outputs to dist/ which Capacitor reads via webDir.
/// </summary>
export default defineConfig({
  plugins: [
    react(),
  ],
  define: {
    'import.meta.env.VITE_PLATFORM': JSON.stringify('capacitor'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
});
