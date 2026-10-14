export interface IFileService {
    createFile(fileNameWithExtension: string, content?: string, directory?: string): Promise<string>;
    writeFile(fileNameWithExtension: string, content: string, directory?: string): Promise<string>;
    checkFileExists(fileNameWithExtension: string, directory?: string): Promise<boolean>;
    readTextContent(url: string): Promise<string>;
    detectFileEncoding(url: string): Promise<string>;
    detectContentType(url: string): Promise<string>;
    decodeFile(bytes: Buffer, encoding: string): string;
}