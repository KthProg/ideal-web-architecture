import { createServer } from 'node:http';

import { render as renderHomePage } from './render/home.ts';
import { render as renderFilesList } from './render/files.ts';
import { FileHelper } from './helpers/file.ts';

const PORT = 3001;

const server = createServer(async (request, response) => {
  // TODO: some kind of basic routing lib
  console.log('request received', `${request.method} - ${request.url}`);
  try {

    if(request.url?.startsWith('/public/')){
      const fileData = await FileHelper.readTextContent(request.url);
      response.writeHead(200, {
        // TODO: content type from file extension
        'Content-Type': 'text/javascript; charset=utf-8'
      });

      response.end(fileData);
      return;
    }

    let html = null;
    switch(request.url){
      case '/':
        if (!['GET'].includes(request.method ?? '')) {
          response.writeHead(405);
          response.end('Method Not Allowed');
          return;
        }
        html = await renderHomePage();
        break;
      case '/files':
        if (!['GET', 'POST'].includes(request.method ?? '')) {
          response.writeHead(405);
          response.end('Method Not Allowed');
          return;
        }
        switch(request.method ?? ''){
          case 'POST':
            await FileHelper.createRandomFile();  
            // falls through to GET after creating file
          case 'GET':
            html = await renderFilesList();
            break;
        }
        break;
    }

    if(html){
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });

      response.end(html);
    } else {
      response.writeHead(404);
      response.end('Not Found');
    }
  } catch (error) {
    console.error(error);

    response.writeHead(500, {
      'Content-Type': 'text/plain; charset=utf-8'
    });

    response.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
