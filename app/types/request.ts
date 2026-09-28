import type { IncomingMessage, ServerResponse } from "http";

export type RouteRequest = IncomingMessage & {
    url: string;
    method: HTTP_METHOD;
};

export type RouteResponse = ServerResponse<IncomingMessage> & {
    req: IncomingMessage;
};

export type HTTP_METHOD = 'GET'|'POST'|'PUT'|'OPTIONS';