import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Dev server settings
  server: {
    host: "::",     // IPv6 localhost (use "0.0.0.0" for IPv4)
    port: 8080,
  },

  // Plugins
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  // Module resolution
  resolve: {
    alias: {
      // Now you can import with "@/..." from src/
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"], // Force single instance of React
  },

  // Optimizations
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true,
  },

  // Build output settings
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: `js/[name]-[hash].js`,
        entryFileNames: `js/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
      },
    },
  },
}));
