import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // 🔁 change from "/" to "/stagyn/"
  build: {
    outDir: 'dist',
  },
  server: {
    historyApiFallback: true, // Optional, applies if using Vite dev server
  },
});
