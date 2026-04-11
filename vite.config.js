import { defineConfig } from 'vite';

export default defineConfig({
  // Root of the project is where index.html is
  root: './',
  // Output directory for build
  build: {
    outDir: 'dist',
  },
  // Ensure the server serves index.html by default
  server: {
    open: true,
  }
});
