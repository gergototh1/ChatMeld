import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  build: {
    outDir: 'docs',
    assetsInlineLimit: Infinity,
    target: 'esnext',
  },
  plugins: [react(), viteSingleFile()],
});
