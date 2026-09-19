import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { fileURLToPath, URL } from "node:url";

// Static single-page build for GitHub Pages.
//
// `base` stays "/" because the site is served from the custom domain root
// (https://upstatetechnologysolutions.com/). Only if you ever preview the
// raw https://<user>.github.io/<repo>/ URL would you need a different base:
//   VITE_BASE=/<repo-name>/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE || "/",
  plugins: [
    // Must come before the React plugin. Regenerates src/routeTree.gen.ts.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  build: {
    // three.js + drei are large; the map is already lazy-loaded from hero.tsx.
    chunkSizeWarningLimit: 1500,
  },
});
