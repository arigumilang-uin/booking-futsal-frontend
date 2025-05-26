/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default () => {
  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
    },
  })
}
