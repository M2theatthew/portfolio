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
  // lucide-react is intentionally NOT excluded here. Excluding it forces
  // Vite's dev server to serve it as raw unbundled ESM — and lucide-react's
  // barrel file re-exports every icon as its own file (1000+ of them), so
  // the browser ends up fetching each icon as a separate network request.
  // One of those is literally named fingerprint.js (the icon glyph, unrelated
  // to browser fingerprinting) — ad blockers and privacy extensions commonly
  // block any script URL containing "fingerprint" as an anti-fingerprinting
  // heuristic, which fails that one module and crashes the whole import
  // graph for every component using lucide-react icons. Letting Vite
  // pre-bundle it into a single chunk avoids the per-file requests (and
  // the false-positive block) entirely.
  optimizeDeps: {
    include: ['lucide-react'],
  },
});
