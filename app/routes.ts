import { HTML_ROUTE_HEADERS, HTTP_METHODS, TEXT_ROUTE_HEADERS } from "./constants/http.ts";
import { FileHelper } from "./helpers/file.ts";
import type { Route } from "./types/route.ts";
import { render as renderHomePage } from './render/home.ts';
import { render as renderFilesList } from './render/files.ts';
import { FILENAME_REGEX_EXPRESSION } from "./constants/file.ts";

// FUTURE: RouteBuilder so we can compose routes more easily
export const ROUTES: Route[] = [
    {
        path: new RegExp(`\/public\/${FILENAME_REGEX_EXPRESSION}`),
        allowedMethods: 'GET',
        getData: async (req, _res) => {
            const data = await FileHelper.readTextContent(req.url);
            console.info(`file head (${req.url})`, data.slice(0, 100));
            return data;
        },
        getHeaders: async (req, _res) => {
            return await FileHelper.getFileContentTypeHeader(req.url);
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
    }, {
        path: new RegExp(`\/file\/${FILENAME_REGEX_EXPRESSION}`),
        allowedMethods: 'GET',
        getData: async (req, _res) => {
            const normalizedUrl = req.url.replace('/file/', '/notes/');
            return await FileHelper.readTextContent(normalizedUrl);
        },
        getHeaders: async (req, _res) => {
            const normalizedUrl = req.url.replace('/file/', '/notes/');
            return await FileHelper.getFileContentTypeHeader(normalizedUrl);
        },
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