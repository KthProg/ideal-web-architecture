import { HTML_ROUTE_HEADERS, HTTP_METHODS } from "./constants/http.ts";
import { FileHelper } from "./helpers/file.ts";
import type { Route } from "./types/route.ts";
import { render as renderHomePage } from './render/home.ts';
import { render as renderFilesList } from './render/files.ts';

export const ROUTES: Route[] = [
    {
        path: new RegExp('\/public\/.+(\.js)'),
        allowedMethods: 'GET',
        getData: async (req, _res) => {
            const data = await FileHelper.readTextContent(req.url);
            console.info(`file head (${req.url})`, data.slice(0, 1000));
            return data;
        },
        getHeaders: async (req, _res) => {
            const contentTypeAndEncoding = await FileHelper.getContentTypeAndEncoding(req.url);
            return {
                // TODO: content type from file extension
                'Content-Type': `${contentTypeAndEncoding.contentType}; charset=${contentTypeAndEncoding.encoding}`
            }
        },
    }, {
        path: '/',
        allowedMethods: 'GET',
        getData: async (_req, _res) => await renderHomePage(),
        headers: HTML_ROUTE_HEADERS,
    }, {
        path: '/files',
        allowedMethods: 'GET',
        getData: async (_req, _res) => await renderFilesList(),
        headers: HTML_ROUTE_HEADERS,
    }, {
        path: '/files',
        allowedMethods: 'POST',
        getData: async (_req, _res) => {
            // TODO: some way to fall through to GET route to avoid duplication here
            await FileHelper.createRandomFile();
            return await renderFilesList();
        },
        headers: HTML_ROUTE_HEADERS,
    },
];

export const NOT_FOUND_ROUTE: Route = {
    allowedMethods: HTTP_METHODS,
    getData: async (req, _res) => {
        return {
            status: 404,
            // TODO: safe-escape URL in case HTML injected
            content: `No route matches URL: ${req.url}`,
        };
    },
};

export const METHOD_NOT_ALLOWED_ROUTE: Route = {
    allowedMethods: HTTP_METHODS,
    getData: async (req, _res) => {
        return {
            status: 405,
            // TODO: safe-escape URL in case HTML injected
            content: `Method ${req.method} not allowed on route: ${req.url}`,
        };
    },
};

export const SERVER_ERROR_ROUTE: Route = {
    allowedMethods: HTTP_METHODS,
    getData: async (req, _res) => {
        return {
            status: 500,
            // TODO: safe-escape URL in case HTML injected
            content: `Error handling method ${req.method} on route: ${req.url}`,
        };
    },
};