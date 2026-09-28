import { createServer } from 'node:http';

import { Router } from './helpers/router.ts';
import { ROUTES } from './routes.ts';

const PORT = 3001;
const ROUTER = new Router(ROUTES);

const server = createServer(async (request, response) => {
  console.log('request received', `${request.method} - ${request.url}`);
  try {
    await ROUTER.handleRoute(request, response);
  } catch (ex) {
    console.error(ex);
    response.writeHead(500, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
