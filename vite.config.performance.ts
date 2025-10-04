import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import { componentTagger } from "lovable-tagger"

// Enhanced performance configuration
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'swiper-vendor': ['swiper'],
          'query-vendor': ['@tanstack/react-query'],
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
    // Enable minification
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    exclude: ['swiper'],
  },
}))
