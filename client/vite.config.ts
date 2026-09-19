import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@shared": path.resolve(import.meta.dirname, "../types"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    // Same-origin API in dev: the browser calls /api on :5173 and Vite forwards
    // it to Express, so the session cookie is first-party. Vercel's rewrite
    // does the same job in production (see vercel.json).
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: false },
    },
  },
});
