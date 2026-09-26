import path, { dirname } from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import { render as renderFilesList } from './files.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const render = async () => {
    const bodyContent = await renderFilesList();
    const baseViewPath = path.join(__dirname, '../views', 'base.ejs');
    return await ejs.renderFile(baseViewPath, { content: bodyContent, title: 'Home' });
};