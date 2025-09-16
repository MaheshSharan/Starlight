import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/controllers': resolve(__dirname, './src/controllers'),
      '@/services': resolve(__dirname, './src/services'),
      '@/repositories': resolve(__dirname, './src/repositories'),
      '@/middleware': resolve(__dirname, './src/middleware'),
      '@/routes': resolve(__dirname, './src/routes'),
      '@/validators': resolve(__dirname, './src/validators'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
});