import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/scanner/geo/',
  build: {
    outDir: path.resolve(__dirname, '../../claw-agency/website/scanner/geo'),
    emptyOutDir: true,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://clawops-scanner.fly.dev'
    ),
  },
});
