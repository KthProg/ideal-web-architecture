import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import getEncoding from 'detect-character-encoding';
import iconv from 'iconv-lite';
import { fileTypeFromFile } from "file-type";

export class FileHelper {
    static get rootDir(){
        const __filename = fileURLToPath(import.meta.url);
        return path.join(dirname(__filename), '../');
    }

    static get publicDir(){
        return path.join(FileHelper.rootDir, 'public');
    }

    static get filesDir(){
        return path.join(FileHelper.rootDir, 'notes');
    }

    private static decodeFile(bytes: Buffer, encoding: string) {
        try {
            return new TextDecoder(encoding).decode(bytes);
        } catch {
            return iconv.decode(bytes, encoding);
        }
    }

    static async createRandomFile() {
        const newFilePath = path.join(FileHelper.filesDir, `test-${Date.now()}.md`);
        const newFileContent = `${Date.now()}`;
        await fs.writeFile(newFilePath, newFileContent, {
            flag: 'wx'
        });
        return newFilePath;
    }

    static async readTextContent(url: string) {
        const filePath = path.join(FileHelper.rootDir, url);
        const fileData = await fs.readFile(filePath);
        const currentEncoding = await FileHelper.detectFileEncoding(url);
        return FileHelper.decodeFile(fileData, currentEncoding);
    }

    static async detectFileEncoding(url: string) {
        const filePath = path.join(FileHelper.rootDir, url);
        const fileData = await fs.readFile(filePath);
        const encodingResult = getEncoding(fileData);
        return encodingResult?.encoding ?? 'utf8';
    }

    static async detectContentType(url: string) {
        const filePath = path.join(FileHelper.rootDir, url);
        return (await fileTypeFromFile(filePath)) ?? 'text/plain';
    }

    static async getFileContentTypeHeader(url: string) {
        const encoding = await FileHelper.detectFileEncoding(url);
        const mimeType = await FileHelper.detectContentType(url);
        return {
            'Content-Type': `${mimeType}; charset=${encoding}`
        };
    }
}