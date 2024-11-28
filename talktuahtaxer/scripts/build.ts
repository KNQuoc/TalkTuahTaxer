import { build } from 'vite';
build().then(() => {
    console.log('Build completed successfully.');
}).catch((error) => {
    console.error('Build failed:', error);
});