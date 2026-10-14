export interface IFileService {
    createFile(filePath: string, content?: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<string>;
    checkFileExists(filePath: string): Promise<boolean>;
    readTextContent(filePath: string): Promise<string>;
    detectFileEncoding(filePath: string): Promise<string>;
    detectContentType(filePath: string): Promise<string>;
    decodeFile(bytes: Buffer, encoding: string): string;
}
