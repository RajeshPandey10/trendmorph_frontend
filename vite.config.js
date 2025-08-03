import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env file
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    plugins: [react(), tailwindcss()],
    server: {
      
      headers: {
        // Allow cross-domain popups to communicate via postMessage
        "Cross-Origin-Opener-Policy": "unsafe-none",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
