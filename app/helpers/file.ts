import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

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
        return await fs.readFile(filePath, { encoding: 'utf8'});
    }
}