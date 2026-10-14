import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import getEncoding from 'detect-character-encoding';
import iconv from 'iconv-lite';
import { fileTypeFromFile } from "file-type";
import { IFileService } from './interfaces/file.ts';

export class FileService implements IFileService {
    static get rootDir(){
        const __filename = fileURLToPath(import.meta.url);
        return path.join(dirname(__filename), '../');
    }

    static get publicDir(){
        return path.join(FileService.rootDir, 'public');
    }

    static urlToPath(url: string): string {
        return path.join(FileService.rootDir, url);
    }

    decodeFile(bytes: Buffer, encoding: string) {
        try {
            return new TextDecoder(encoding).decode(bytes);
        } catch {
            return iconv.decode(bytes, encoding);
        }
    }

    async createFile(filePath: string, content?: string): Promise<string> {
        await fs.writeFile(filePath, content ?? '', { flag: 'wx' });
        return filePath;
    }

    async writeFile(filePath: string, content: string): Promise<string> {
        await fs.writeFile(filePath, content);
        return filePath;
    }

    async checkFileExists(filePath: string): Promise<boolean> {
        try {
            await fs.stat(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async readTextContent(filePath: string): Promise<string> {
        const fileData = await fs.readFile(filePath);
        const encoding = await this.detectFileEncoding(filePath);
        return this.decodeFile(fileData, encoding);
    }

    async detectFileEncoding(filePath: string): Promise<string> {
        const fileData = await fs.readFile(filePath);
        const encodingResult = getEncoding(fileData);
        return encodingResult?.encoding ?? 'utf8';
    }

    async detectContentType(filePath: string): Promise<string> {
        const detected = await fileTypeFromFile(filePath);
        return detected?.mime ?? 'text/plain';
    }
}
