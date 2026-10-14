export interface IFileService {
    createFile(fileNameWithExtension: string, directory: string): Promise<string>;
    readTextContent(url: string): Promise<string>;
    detectFileEncoding(url: string): Promise<string>;
    detectContentType(url: string): Promise<string>;
    decodeFile(bytes: Buffer, encoding: string): string;
}