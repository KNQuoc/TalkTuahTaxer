// scripts/build.ts
import { build } from 'vite';
import { resolve } from 'path';
import { mkdirSync, existsSync } from 'fs';

async function buildExtension() {
  try {
    // Ensure dist directory exists
    const distDir = resolve(__dirname, '../dist');
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    // Build the extension
    await build();

    // Log success message
    console.log('Build completed successfully!');
    console.log('Extension files can be found in the dist directory.');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildExtension();