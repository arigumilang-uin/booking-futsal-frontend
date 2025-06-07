// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],

    // Development server configuration
    server: {
      port: 5173,
      host: 'localhost',
      open: true, // Auto-open browser
      cors: true,

      // Proxy configuration for development - Fixed for production backend
      proxy: isDevelopment ? {
        '/api': {
          target: 'https://booking-futsal-production.up.railway.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path, // Keep /api path as is
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('🚨 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('📤 Sending Request to the Target:', req.method, req.url);
              // Add necessary headers for CORS
              proxyReq.setHeader('Origin', 'http://localhost:5173');
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      } : undefined
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: isDevelopment,
      minify: !isDevelopment ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            utils: ['axios']
          }
        }
      }
    },

    // Environment variables
    define: {
      __DEV__: isDevelopment,
      __PROD__: !isDevelopment
    },

    // Preview configuration
    preview: {
      port: 4173,
      host: 'localhost'
    }
  };
});
