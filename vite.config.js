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

      // Proxy configuration for development - Always enabled for CORS fix
      proxy: {
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
              // Add necessary headers for CORS and authentication
              proxyReq.setHeader('Origin', 'https://booking-futsal-production.up.railway.app');
              proxyReq.setHeader('Access-Control-Allow-Credentials', 'true');
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log('📥 Received Response from the Target:', proxyRes.statusCode, req.url);
              // Add CORS headers to response
              proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:5174';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Cookie';
            });
          },
        }
      }
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
