import fs from 'fs/promises';
import path, { dirname } from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const render = async () => {
    const notesPath = path.join(__dirname, '../notes');
    const files = await fs.readdir(notesPath, {withFileTypes: true});
    const normalizedFiles = files.map((file) => ({
        name: file.name,
        isDirectory: file.isDirectory(),
    }));

    const viewPath = path.join(__dirname, '../views/partial', 'files.ejs');
    return await ejs.renderFile(viewPath, { files: normalizedFiles });
};