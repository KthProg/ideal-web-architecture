import { IncomingMessage } from "http";
import { RouteResponse } from "../../types/request.ts";

export interface IRouter {
    handleRoute(request: IncomingMessage, response: RouteResponse): Promise<void>;
}