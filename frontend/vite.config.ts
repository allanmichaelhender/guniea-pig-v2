import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Needed to access the server from outside the container
    watch: {
      usePolling: true, // Forces Vite to "manually" check for changes in Docker
    },
    hmr: {
      clientPort: 5173, // Ensures the browser connects to the right HMR port
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
