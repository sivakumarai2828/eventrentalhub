import path from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During development, /api requests are proxied to the FastAPI backend.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // 127.0.0.1 (not localhost) avoids Windows resolving to IPv6 ::1,
      // which the backend may not be listening on.
      "/api": "http://127.0.0.1:8000",
    },
  },
});
