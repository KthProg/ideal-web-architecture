import path from "path";
import { INoteService } from "./interfaces/note.ts";
import fs from 'fs/promises';
import getEncoding from 'detect-character-encoding';
import { IConfigService } from "./interfaces/config.ts";
import { IFileService } from "./interfaces/file.ts";

export class NoteService implements INoteService {
    constructor(public fileService: IFileService, public configService: IConfigService){
    }

    get notesDir(){
        return this.configService.config.notesLocation;
    }

    async createRandomFile() {
        return await this.fileService.createFile(`test-${Date.now()}.md`, '', this.notesDir);
    }

    async readNoteContent(filename: string) {
        const safeName = path.basename(filename);
        const filePath = path.join(this.notesDir, safeName);
        const fileData = await fs.readFile(filePath);
        const encoding = getEncoding(fileData)?.encoding ?? 'utf8';
        return this.fileService.decodeFile(fileData, encoding);
    }

    async writeNoteContent(filename: string, content: string) {
        const safeName = path.basename(filename);
        const filePath = path.join(this.notesDir, safeName);
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