import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // Defaults to '/' — correct for the custom domain (upstatetechnologysolutions.com),
  // which serves these files at the root. GitHub Pages' own preview URL
  // (https://<user>.github.io/<repo>/) serves the same files one path
  // segment deeper, so absolute asset paths there would 404. To spot-check
  // that specific URL, build once with:
  //   VITE_BASE=/<repo-name>/ npm run build
  // then serve dist/ with any static server (npm run preview won't match
  // the base automatically). Don't set VITE_BASE for the real deploy —
  // leave it unset so it falls back to '/'.
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
