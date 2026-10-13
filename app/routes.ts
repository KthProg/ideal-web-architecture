import { HTML_ROUTE_HEADERS } from './constants/http.ts';
import { FileHelper } from './helpers/file.ts';
import { Router } from './helpers/router.ts';
import { Get, Post } from './decorators/route.ts';
import { render as renderHomePage } from './render/home.ts';
import { render as renderFilesList } from './render/files.ts';
import { FILENAME_REGEX_EXPRESSION } from './constants/file.ts';
import type { RouteRequest, RouteResponse } from './types/request.ts';
import type { HandlerResponse } from './types/handler-response.ts';

export class AppRouter extends Router {
    @Get(new RegExp(`\/public\/${FILENAME_REGEX_EXPRESSION}`))
    async servePublicFile(req: RouteRequest, _res: RouteResponse): Promise<HandlerResponse> {
        const content = await FileHelper.readTextContent(req.url);
        console.info(`file head (${req.url})`, content.slice(0, 100));
        const headers = await FileHelper.getFileContentTypeHeader(req.url);
        return { content, headers };
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
