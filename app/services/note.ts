import path from "path";
import { FileService } from "./file.ts";
import { INoteService } from "./interfaces/note.ts";
import fs from 'fs/promises';
import getEncoding from 'detect-character-encoding';

export class NoteService implements INoteService {
    get fileService() {
        return FileService.instance;
    }

    static get notesDir(){
        return path.join(FileService.rootDir, 'notes');
    }

    async createRandomFile(notesDir = NoteService.notesDir) {
        return await this.fileService.createFile(`test-${Date.now()}.md`, notesDir);
    }

    async readNoteContent(filename: string, notesDir = NoteService.notesDir) {
        const safeName = path.basename(filename);
        const filePath = path.join(notesDir, safeName);
        const fileData = await fs.readFile(filePath);
        const encoding = getEncoding(fileData)?.encoding ?? 'utf8';
        return this.fileService.decodeFile(fileData, encoding);
    }

    async writeNoteContent(filename: string, content: string, notesDir = NoteService.notesDir) {
        const safeName = path.basename(filename);
        const filePath = path.join(notesDir, safeName);
        await fs.writeFile(filePath, content, { encoding: 'utf8' });
        return content;
    }

    async getFileContentTypeHeader(url: string) {
        const encoding = await this.fileService.detectFileEncoding(url);
        const mimeType = await this.fileService.detectContentType(url);
        return {
            'Content-Type': `${mimeType}; charset=${encoding}`
        };
    }
}