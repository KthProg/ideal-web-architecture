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
import { HTML_ROUTE_HEADERS, NOTES_LOCATION_HEADER } from './constants/http.ts';
import { FileHelper } from './helpers/file.ts';
import { Router } from './helpers/router.ts';
import { Get, Post } from './decorators/route.ts';
import { FILENAME_REGEX_EXPRESSION } from './constants/file.ts';
import type { RouteRequest, RouteResponse } from './types/request.ts';
import type { HandlerResponse } from './types/handler-response.ts';

export class AppRouter extends Router {
    private notesDir(req: RouteRequest): string {
        const header = req.headers[NOTES_LOCATION_HEADER.toLowerCase()];
        const location = Array.isArray(header) ? header[0] : header;
        return (location && path.isAbsolute(location)) ? location : FileHelper.defaultFilesDir;
    }

    private async renderNotesList(notesDir: string): Promise<string> {
        const notes = await fs.readdir(notesDir, { withFileTypes: true });
        const normalizedNotes = notes
            .filter(n => !n.isDirectory())
            .map(n => ({ name: n.name }));
        const viewPath = path.join(FileHelper.rootDir, 'views/partial', 'notes.ejs');
        return ejs.renderFile(viewPath, { notes: normalizedNotes });
    }

    private async renderHome(req: RouteRequest): Promise<string> {
        const bodyContent = await this.renderNotesList(this.notesDir(req));
        const baseViewPath = path.join(FileHelper.rootDir, 'views', 'base.ejs');
        return ejs.renderFile(baseViewPath, { content: bodyContent, title: 'Notes' });
    }

    private noteEditorHtml(filename: string, content: string): string {
        const encoded = encodeURIComponent(filename);
        return `<markdown-editor editable hx-post="/note/${encoded}" hx-trigger="md-change" hx-vals="js:{content: event.detail.content}" hx-swap="innerHTML" hx-disabled-elt="this">${content}</markdown-editor>`;
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
    async home(req: RouteRequest): Promise<HandlerResponse> {
        return { content: await this.renderHome(req), headers: HTML_ROUTE_HEADERS };
    }

    @Get('/settings')
    async settings(): Promise<HandlerResponse> {
        const viewPath = path.join(FileHelper.rootDir, 'views/partial', 'settings.ejs');
        return { content: await ejs.renderFile(viewPath), headers: HTML_ROUTE_HEADERS };
    }

    @Get('/notes')
    async listNotes(req: RouteRequest): Promise<HandlerResponse> {
        return { content: await this.renderNotesList(this.notesDir(req)), headers: HTML_ROUTE_HEADERS };
    }

    @Post('/notes')
    async createNote(req: RouteRequest): Promise<HandlerResponse> {
        const notesDir = this.notesDir(req);
        await FileHelper.createRandomFile(notesDir);
        return { content: await this.renderNotesList(notesDir), headers: HTML_ROUTE_HEADERS };
    }

    @Get(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async getNote(req: RouteRequest): Promise<HandlerResponse> {
        const filename = decodeURIComponent(path.basename(req.url));
        const content = await FileHelper.readNoteContent(filename, this.notesDir(req));
        return { content: this.noteEditorHtml(filename, content), headers: HTML_ROUTE_HEADERS };
    }

    @Post(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async saveNote(req: RouteRequest): Promise<HandlerResponse> {
        const notesDir = this.notesDir(req);
        const filename = decodeURIComponent(path.basename(req.url));
        const body = new URLSearchParams(await this.readBody(req));
        const content = body.get('content') ?? '';
        await FileHelper.writeNoteContent(filename, content, notesDir);
        const saved = await FileHelper.readNoteContent(filename, notesDir);
        return { content: saved, headers: HTML_ROUTE_HEADERS };
    }
}
