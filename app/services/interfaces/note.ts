import { IFileService } from "./file.ts";

export interface INoteService {
    get fileService(): IFileService;
    createRandomFile(notesDir: string): Promise<string>;
    readNoteContent(filename: string, notesDir: string): Promise<string>;
    writeNoteContent(filename: string, content: string, notesDir: string): Promise<string>;
    getFileContentTypeHeader(url: string): Promise<Record<string, string>>;
}