import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ command }) => ({
  base: '/ChatMeld/',
  build: {
    outDir: 'docs',
    assetsInlineLimit: Infinity,
    target: 'esnext',
  },
  plugins: [
    react(),
    ...(command === 'build' ? [viteSingleFile()] : []),
  ],
}));
