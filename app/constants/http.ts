import type { HTTP_METHOD } from "../types/request.ts";

export const HTTP_METHODS: HTTP_METHOD[] = ['GET', 'POST', 'PUT', 'OPTIONS'] as const;

export const HTML_ROUTE_HEADERS = {
    'Content-Type': 'text/html; charset=utf-8'
} as const;

export const TEXT_ROUTE_HEADERS = {
    'Content-Type': 'text/plain; charset=utf-8'
} as const;

export const DEFAULT_RESPONSE_HEADERS = {} as const;