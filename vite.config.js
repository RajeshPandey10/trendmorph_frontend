import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // Load env file
  const env = loadEnv(mode, process.cwd());
  process.env = { ...process.env, ...env };

  // Get the API base URL from environment
  const apiBaseUrl =
    env.VITE_API_BASE_URL || "https://trendmorph-ai-backend.onrender.com";
  console.log(`Vite Config - Mode: ${mode}, API Base URL: ${apiBaseUrl}`);

  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Explicitly define environment variables
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(apiBaseUrl),
    },
    server: {
      headers: {
        // Allow cross-domain popups to communicate via postMessage
        "Cross-Origin-Opener-Policy": "unsafe-none",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
      // Add proxy for Django webscraping backend to avoid CORS issues
      proxy: {
        // Proxy Django webscraping API
        "/api/webscraping": {
          target: "https://backend-webscraping-apis.onrender.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/webscraping/, "/api"),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      },
      // NOTE: Proxy disabled to use production backend even in development
      // Uncomment the proxy section below if you need to use local backend
      /*
      proxy: {
        "/api": {
          target: "http://localhost:8000", // Local backend for development only
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: "http://localhost:8000", // Local backend for development only
          changeOrigin: true,
          secure: false,
        },
      },
      */
    },
  };
});
