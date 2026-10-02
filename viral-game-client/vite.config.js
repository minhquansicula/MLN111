import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/gameHub": { target: "http://127.0.0.1:5001", ws: true },
      "/health": "http://127.0.0.1:5001",
    },
  },
});
