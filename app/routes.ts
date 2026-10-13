import fs from 'fs/promises';
import path from 'path';
import ejs from 'ejs';

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
    private async renderNotesList(): Promise<string> {
        const notes = await fs.readdir(FileHelper.filesDir, { withFileTypes: true });
        const normalizedNotes = notes
            .filter(n => !n.isDirectory())
            .map(n => ({ name: n.name }));
        const viewPath = path.join(FileHelper.rootDir, 'views/partial', 'notes.ejs');
        return ejs.renderFile(viewPath, { notes: normalizedNotes });
    }

    private async renderHome(): Promise<string> {
        const bodyContent = await this.renderNotesList();
        const baseViewPath = path.join(FileHelper.rootDir, 'views', 'base.ejs');
        return ejs.renderFile(baseViewPath, { content: bodyContent, title: 'Notes' });
    }

    private noteEditorHtml(filename: string, content: string): string {
        const encoded = encodeURIComponent(filename);
        return `<markdown-editor editable hx-post="/note/${encoded}" hx-trigger="md-change" hx-vals="js:{content: event.detail.content}" hx-disabled-elt="this">${content}</markdown-editor>`;
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

    @Get('/notes')
    async listNotes(): Promise<HandlerResponse> {
        return { content: await this.renderNotesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Post('/notes')
    async createNote(): Promise<HandlerResponse> {
        await FileHelper.createRandomFile();
        return { content: await this.renderNotesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Get(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async getNote(req: RouteRequest): Promise<HandlerResponse> {
        const filename = decodeURIComponent(path.basename(req.url));
        const content = await FileHelper.readNoteContent(filename);
        return { content: this.noteEditorHtml(filename, content), headers: HTML_ROUTE_HEADERS };
    }

    @Post(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async saveNote(req: RouteRequest): Promise<HandlerResponse> {
        const filename = decodeURIComponent(path.basename(req.url));
        const body = new URLSearchParams(await this.readBody(req));
        const content = body.get('content') ?? '';
        await FileHelper.writeNoteContent(filename, content);
        const saved = await FileHelper.readNoteContent(filename);
        return { content: this.noteEditorHtml(filename, saved), headers: HTML_ROUTE_HEADERS };
    }
}
