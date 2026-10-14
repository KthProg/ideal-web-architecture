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
import { HTML_ROUTE_HEADERS, JSON_ROUTE_HEADERS } from './constants/http.ts';
import { FileService } from './services/file.ts';
import { Router } from './services/router.ts';
import { Get, Post, Put } from './decorators/route.ts';
import { FILENAME_REGEX_EXPRESSION } from './constants/file.ts';
import type { RouteRequest, RouteResponse } from './types/request.ts';
import type { HandlerResponse } from './types/handler-response.ts';
import { INoteService } from './services/interfaces/note.ts';
import { NoteService } from './services/note.ts';
import { IConfigService } from './services/interfaces/config.ts';
import { ConfigService } from './services/config.ts';
import { AppConfig } from './types/config.ts';
import { IFileService } from './services/interfaces/file.ts';

export class AppRouter extends Router {
    private _notesService: INoteService | null = null;
    get notesService() {
        this._notesService ??= new NoteService(this.fileService, this.configService);
        return this._notesService;
    }

    private _configService: IConfigService | null = null;
    get configService() {
        this._configService ??= new ConfigService(this.fileService);
        return this._configService;
    }

    private _fileService: IFileService | null = null;
    get fileService() {
        this._fileService ??= new FileService();
        return this._fileService;
    }

    private async renderNotesList(): Promise<string> {
        const notes = await fs.readdir(this.notesService.notesDir, { withFileTypes: true });
        const normalizedNotes = notes
            .filter(n => !n.isDirectory())
            .map(n => ({ name: n.name }));
        const viewPath = path.join(FileService.rootDir, 'views/partial', 'notes.ejs');
        return ejs.renderFile(viewPath, { notes: normalizedNotes });
    }

    private async renderHome(_req: RouteRequest): Promise<string> {
        const bodyContent = await this.renderNotesList();
        const baseViewPath = path.join(FileService.rootDir, 'views', 'base.ejs');
        return ejs.renderFile(baseViewPath, { content: bodyContent, title: 'Notes' });
    }

    private noteEditorHtml(filename: string, content: string): string {
        const encoded = encodeURIComponent(filename);
        return `<markdown-editor editable hx-post="/note/${encoded}" hx-trigger="md-change" hx-vals="js:{content: event.detail.content}" hx-swap="innerHTML" hx-disabled-elt="this">${content}</markdown-editor>`;
    }

    @Get(new RegExp(`\/public\/${FILENAME_REGEX_EXPRESSION}`))
    async servePublicFile(req: RouteRequest, _res: RouteResponse): Promise<HandlerResponse> {
        const content = await this.fileService.readTextContent(FileService.urlToPath(req.url));
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
        const viewPath = path.join(FileService.rootDir, 'views/partial', 'settings.ejs');
        return { content: await ejs.renderFile(viewPath), headers: HTML_ROUTE_HEADERS };
    }

    @Get('/notes')
    async listNotes(_req: RouteRequest): Promise<HandlerResponse> {
        return { content: await this.renderNotesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Post('/notes')
    async createNote(_req: RouteRequest): Promise<HandlerResponse> {
        await this.notesService.createRandomFile();
        return { content: await this.renderNotesList(), headers: HTML_ROUTE_HEADERS };
    }

    @Get(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async getNote(req: RouteRequest): Promise<HandlerResponse> {
        const filename = decodeURIComponent(path.basename(req.url));
        const content = await this.notesService.readNoteContent(filename);
        return { content: this.noteEditorHtml(filename, content), headers: HTML_ROUTE_HEADERS };
    }

    @Post(new RegExp(`\/note\/${FILENAME_REGEX_EXPRESSION}`))
    async saveNote(req: RouteRequest): Promise<HandlerResponse> {
        const filename = decodeURIComponent(path.basename(req.url));
        const body = new URLSearchParams(await this.readBody(req));
        const content = body.get('content') ?? '';
        await this.notesService.writeNoteContent(filename, content);
        const saved = await this.notesService.readNoteContent(filename);
        return { content: saved, headers: HTML_ROUTE_HEADERS };
    }

    @Put('/config')
    async updateConfig(req: RouteRequest): Promise<HandlerResponse> {
        const body = new URLSearchParams(await this.readBody(req));
        const content = body.get('config') ?? '';
        try {
            const configPartial: Partial<AppConfig> = JSON.parse(content);
            const updated = await this.configService.updateConfig(configPartial);
            return { content: JSON.stringify(updated), headers: JSON_ROUTE_HEADERS };
        } catch(ex) {
            console.error('Failed to update config', ex);
            return { status: 500, content: '' };
        }
    }

    @Get('/config')
    async getConfig(_req: RouteRequest): Promise<HandlerResponse> {
        const config = await this.configService.readConfig();
        return { content: JSON.stringify(config), headers: JSON_ROUTE_HEADERS };
    }
}
