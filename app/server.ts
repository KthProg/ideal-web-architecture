import { createServer } from 'node:http';
import { AppRouter } from './routes.ts';

const PORT = 3001;
const ROUTER = new AppRouter();

const server = createServer(async (request, response) => {
    console.log('request received', `${request.method} - ${request.url}`);
    try {
        await ROUTER.handleRoute(request, response);
    } catch (ex) {
        console.error(ex);
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Internal Server Error');
    }
});

server.listen(PORT, async () => {
    try {
        await ROUTER.configService.initialize();
    } catch (ex) {
        console.error('Error initializing config service', ex);
    }
    console.log(`http://localhost:${PORT}`);
});
