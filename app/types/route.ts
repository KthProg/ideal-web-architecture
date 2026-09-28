import type { HTTP_METHOD, RouteRequest, RouteResponse } from "./request.ts";

export type Route = {
    path?: string | RegExp;
    getData: (
        request: RouteRequest,
        response: RouteResponse,
    ) => Promise<{
        status: number;
        content: string;
    }> | Promise<string>;
    templateFile?: string;
    allowedMethods: HTTP_METHOD[] | HTTP_METHOD;
    headers?: Record<string, string>;
    getHeaders?: (
        request: RouteRequest,
        response: RouteResponse,
    ) => Promise<Record<string, string>>;
};