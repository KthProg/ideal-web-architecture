import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import getEncoding from 'detect-character-encoding';
import iconv from 'iconv-lite';
import { fileTypeFromFile } from "file-type";
import { IFileService } from './interfaces/file.ts';

export class FileService implements IFileService {
    private static _instance: FileService | null = null;

    static get instance() {
        return FileService._instance ?? new FileService();
    }

    static get rootDir(){
        const __filename = fileURLToPath(import.meta.url);
        return path.join(dirname(__filename), '../');
    }

    static get publicDir(){
        return path.join(FileService.rootDir, 'public');
    }

    decodeFile(bytes: Buffer, encoding: string) {
        try {
            return new TextDecoder(encoding).decode(bytes);
        } catch {
            return iconv.decode(bytes, encoding);
        }
    }

    async createFile(fileNameWithExtension: string, directory = FileService.rootDir, content?: string) {
        const newFilePath = path.join(directory, fileNameWithExtension);
        await fs.writeFile(newFilePath, content ?? '', {
            flag: 'wx'
        });
        return newFilePath;
    }

    async writeFile(fileNameWithExtension: string, directory = FileService.rootDir, content: string): Promise<string> {
        const filePath = path.join(directory, fileNameWithExtension);
        await fs.writeFile(filePath, content, {
            flag: 'wx'
        });
        return filePath;
    }

    async checkFileExists(fileNameWithExtension: string, directory = FileService.rootDir): Promise<boolean> {
        const filePath = path.join(directory, fileNameWithExtension);
        try {
            await fs.stat(filePath);
            return true;
        } catch (ex) {
            console.error(`Failed to stat file ${fileNameWithExtension}`, ex);
            return false;
        }
    }

    async readTextContent(url: string) {
        const filePath = path.join(FileService.rootDir, url);
        const fileData = await fs.readFile(filePath);
        const currentEncoding = await FileService.instance.detectFileEncoding(url);
        return FileService.instance.decodeFile(fileData, currentEncoding);
    }

    async detectFileEncoding(url: string) {
        const filePath = path.join(FileService.rootDir, url);
        const fileData = await fs.readFile(filePath);
        const encodingResult = getEncoding(fileData);
        return encodingResult?.encoding ?? 'utf8';
    }

    async detectContentType(url: string) {
        const filePath = path.join(FileService.rootDir, url);
        const detected = await fileTypeFromFile(filePath);
        return detected?.mime ?? 'text/plain';
    }
}