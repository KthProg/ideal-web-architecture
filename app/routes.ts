import path from 'path';
import { HTML_ROUTE_HEADERS } from './constants/http.ts';
import { FileHelper } from './helpers/file.ts';

const PUBLIC_MIME_TYPES: Record<string, string> = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};
import { Router } from './helpers/router.ts';
import { Get, Post } from './decorators/route.ts';
import { render as renderHomePage } from './render/home.ts';
import { render as renderFilesList } from './render/files.ts';
import { FILENAME_REGEX_EXPRESSION } from './constants/file.ts';
import type { RouteRequest, RouteResponse } from './types/request.ts';
import type { HandlerResponse } from './types/handler-response.ts';

export class AppRouter extends Router {
    /**
     * Only serves files from the public directory, hence we trust the extension for its
     * file type here (but not for notes).
     * @param req Raw request
     * @param _res Raw response
     * @returns Object with content (text) and headers including the file content type
     */
    @Get(new RegExp(`\/public\/${FILENAME_REGEX_EXPRESSION}`))
    async servePublicFile(req: RouteRequest, _res: RouteResponse): Promise<HandlerResponse> {
        const content = await FileHelper.readTextContent(req.url);
        console.info(`file head (${req.url})`, content.slice(0, 100));
        const ext = path.extname(req.url).toLowerCase();
        const mimeType = PUBLIC_MIME_TYPES[ext] ?? 'text/plain';
        return { content, headers: { 'Content-Type': mimeType } };
    }

    @Get('/')
    async home(): Promise<HandlerResponse> {
        return { content: await renderHomePage(), headers: HTML_ROUTE_HEADERS };
    }

    @Get('/files')
    async getFiles(): Promise<HandlerResponse> {
        return { content: await renderFilesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Post('/files')
    async createFile(): Promise<HandlerResponse> {
        await FileHelper.createRandomFile();
        return { content: await renderFilesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Get(new RegExp(`\/file\/${FILENAME_REGEX_EXPRESSION}`))
    async getFile(req: RouteRequest): Promise<HandlerResponse> {
        const normalizedUrl = req.url.replace('/file/', '/notes/');
        const content = await FileHelper.readTextContent(normalizedUrl);
        const headers = await FileHelper.getFileContentTypeHeader(normalizedUrl);
        return { content, headers };
    }
}
