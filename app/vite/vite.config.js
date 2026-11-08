import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" macht den Build pfadrelativ, sodass dist/ ueberall funktioniert
// (GitHub Pages Subpath, Netlify, Vercel, eigener Webserver, ...).
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
