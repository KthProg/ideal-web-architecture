import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import getEncoding from 'detect-character-encoding';


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
        const { encoding } = await FileHelper.getContentTypeAndEncoding(url);
        return fileData.toString(encoding);
    }

    static async getContentTypeAndEncoding(url: string) {
        const filePath = path.join(FileHelper.rootDir, url);
        const fileData = await fs.readFile(filePath);
        const encodingResult = getEncoding(fileData);
        return {
            encoding: (encodingResult?.encoding as (BufferEncoding | undefined)) ?? 'utf8',
            contentType: filePath.endsWith('.js') ? 'text/javascript' : 'text/plain',
        };
    }
}