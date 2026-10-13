import { HandlerResponse } from "./handler-response.ts";
import { HTTP_METHOD, RouteRequest, RouteResponse } from "./request.ts";

export type RouteMetadata = {
    httpMethod: HTTP_METHOD;
    path: string | RegExp;
    handlerKey: string;
};

export type HandlerMethod = (req: RouteRequest, res: RouteResponse) => Promise<HandlerResponse>;