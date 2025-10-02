import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Spring Boot 後端地址
        changeOrigin: true,
        secure: false
      }
    }
  }
});
