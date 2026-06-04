import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    // strictPort removed to allow fallback if needed
    proxy: {
      "/api": "http://localhost:8456",
    },
  },
  build: {
    sourcemap: false,
  },
});
