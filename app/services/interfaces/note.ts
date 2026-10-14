import { IFileService } from "./file.ts";

export interface INoteService {
    get fileService(): IFileService;
    get notesDir(): string;
    createRandomFile(): Promise<string>;
    readNoteContent(filename: string): Promise<string>;
    writeNoteContent(filename: string, content: string): Promise<string>;
    getFileContentTypeHeader(url: string): Promise<Record<string, string>>;
}