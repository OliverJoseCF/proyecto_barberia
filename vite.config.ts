import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimizaciones de build
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Usar esbuild para minificación (más rápido que terser)
    minify: 'esbuild',
    // Optimizar tamaño de chunks
    chunkSizeWarningLimit: 1000,
    // Sourcemaps solo en desarrollo
    sourcemap: mode === 'development',
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
}));
