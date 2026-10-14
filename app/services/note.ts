import path from "path";
import { INoteService } from "./interfaces/note.ts";
import { IConfigService } from "./interfaces/config.ts";
import { IFileService } from "./interfaces/file.ts";

export class NoteService implements INoteService {
    constructor(public fileService: IFileService, public configService: IConfigService){
    }

    get notesDir(){
        return this.configService.config.notesLocation;
    }

    async createRandomFile() {
        return await this.fileService.createFile(path.join(this.notesDir, `test-${Date.now()}.md`));
    }

    async readNoteContent(filename: string) {
        return this.fileService.readTextContent(path.join(this.notesDir, path.basename(filename)));
    }

    async writeNoteContent(filename: string, content: string) {
        await this.fileService.writeFile(path.join(this.notesDir, path.basename(filename)), content);
        return content;
    }

    async getFileContentTypeHeader(filePath: string) {
        const encoding = await this.fileService.detectFileEncoding(filePath);
        const mimeType = await this.fileService.detectContentType(filePath);
        return {
            'Content-Type': `${mimeType}; charset=${encoding}`
        };
    }
}
