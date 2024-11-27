// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const manifest = {
  manifest_version: 3,
  name: "Amazon Cart Scraper",
  version: "1.0.0",
  description: "Scrapes Amazon shopping cart details",
  permissions: ["activeTab"],
  action: {
    default_popup: "popup.html"
  },
  content_scripts: [
    {
      matches: ["https://www.amazon.com/gp/cart/view*"],
      js: ["content.js"]
    }
  ]
};

const copyManifest = () => ({
  name: 'copy-manifest',
  buildEnd() {
    const outDir = resolve(__dirname, 'dist');
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }
    writeFileSync(
      resolve(outDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
  }
});

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'public/popup.html'),
        content: resolve(__dirname, 'src/features/content.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});