import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, '')
      },
      '/dify-api': {
        target: 'https://api.dify.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/dify-api/, '')
      }
    }
  }
});
