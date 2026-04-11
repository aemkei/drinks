import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Set base to '/' if using a custom domain, or '/repo-name/' for github.io/repo-name/
  base: './',
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
  }
});
