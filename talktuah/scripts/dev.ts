import { createServer } from 'vite';
import { resolve } from 'path';

async function devServer() {
  const server = await createServer({
    // Configure as per vite.config.ts
    configFile: resolve(__dirname, '../vite.config.ts'),
    server: {
      port: 3000,
      hmr: {
        port: 3001
      }
    }
  });

  await server.listen();
  console.log('Development server started...');
}

devServer();