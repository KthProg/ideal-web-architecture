import fs from 'fs/promises';
import path from 'path';
import ejs from 'ejs';
import { marked } from 'marked';

const PUBLIC_MIME_TYPES: Record<string, string> = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};
import { HTML_ROUTE_HEADERS } from './constants/http.ts';
import { FileHelper } from './helpers/file.ts';
import { Router } from './helpers/router.ts';
import { Get, Post } from './decorators/route.ts';
import { FILENAME_REGEX_EXPRESSION } from './constants/file.ts';
import type { RouteRequest, RouteResponse } from './types/request.ts';
import type { HandlerResponse } from './types/handler-response.ts';

export class AppRouter extends Router {
    private async renderFilesList(): Promise<string> {
        const notesPath = path.join(FileHelper.rootDir, 'notes');
        const files = await fs.readdir(notesPath, { withFileTypes: true });
        const normalizedFiles = files.map((file) => ({
            name: file.name,
            isDirectory: file.isDirectory(),
        }));
        const viewPath = path.join(FileHelper.rootDir, 'views/partial', 'files.ejs');
        return ejs.renderFile(viewPath, { files: normalizedFiles });
    }

    private async renderHome(): Promise<string> {
        const bodyContent = await this.renderFilesList();
        const baseViewPath = path.join(FileHelper.rootDir, 'views', 'base.ejs');
        return ejs.renderFile(baseViewPath, { content: bodyContent, title: 'Home' });
    }

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
        return { content: await this.renderHome(), headers: HTML_ROUTE_HEADERS };
    }

    @Get('/files')
    async getFiles(): Promise<HandlerResponse> {
        return { content: await this.renderFilesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Post('/files')
    async createFile(): Promise<HandlerResponse> {
        await FileHelper.createRandomFile();
        return { content: await this.renderFilesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Get(new RegExp(`\/file\/${FILENAME_REGEX_EXPRESSION}`))
    async getFile(req: RouteRequest): Promise<HandlerResponse> {
        const normalizedUrl = req.url.replace('/file/', '/notes/');
        const raw = await FileHelper.readTextContent(normalizedUrl);
        if (path.extname(normalizedUrl).toLowerCase() === '.md') {
            return { content: `<markdown-editor>${await marked(raw)}</markdown-editor>`, headers: HTML_ROUTE_HEADERS };
        }
        const headers = await FileHelper.getFileContentTypeHeader(normalizedUrl);
        return { content: raw, headers };
    }
}
