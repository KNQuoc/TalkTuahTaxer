import { createServer } from 'vite';

createServer().then(server => {
    server.listen(3000, () => {
        console.log('Development server running at http://localhost:3000');
    });
}).catch((error) => {
    console.error('Failed to start development server:', error);
});