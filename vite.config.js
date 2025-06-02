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

      // Proxy configuration for development
      proxy: isDevelopment ? {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🚨 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📤 Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
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
