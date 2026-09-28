import { IncomingMessage } from "http";
import type { Route } from "../types/route.ts";
import type { RouteRequest, RouteResponse } from "../types/request.ts";
import { METHOD_NOT_ALLOWED_ROUTE, NOT_FOUND_ROUTE, SERVER_ERROR_ROUTE } from "../routes.ts";
import { DEFAULT_RESPONSE_HEADERS } from "../constants/http.ts";
import { ROUTE_JSON_REPLACER } from "./json.ts";

export class Router {
    private routes: Route[] = [];

    constructor(routes: Route[]){
        this.routes = routes;
    }

    private static writeResponse(data: string | {
        status: number;
        content: string;
    }, headers: Record<string, string>, response: RouteResponse) {
        if(typeof data === 'string'){
            response.writeHead(200, headers);
            response.end(data);
        } else {
            response.writeHead(data.status, headers);
            response.end(data.content);
        }
    }

    private static async getHeaders(route: Route, request: RouteRequest, response: RouteResponse) {
        if(route.getHeaders){
            return await route.getHeaders(request, response);
        }
        return route.headers ?? DEFAULT_RESPONSE_HEADERS;
    }

    async handleRoute(
        request: IncomingMessage,
        response: RouteResponse
    ) {
        const requestWithUrlAndMethod = request as RouteRequest;

        const urlPath = request.url;
        if(!urlPath){
            const serverErrorResponseData = await SERVER_ERROR_ROUTE.getData(requestWithUrlAndMethod, response);
            const serverErrorResponseHeaders = await Router.getHeaders(SERVER_ERROR_ROUTE, requestWithUrlAndMethod, response);
            Router.writeResponse(serverErrorResponseData, serverErrorResponseHeaders, response);
            return;
        }

        const method = request.method;
        if(!method){
            const serverErrorResponseData = await SERVER_ERROR_ROUTE.getData(requestWithUrlAndMethod, response);
            const serverErrorResponseHeaders = await Router.getHeaders(SERVER_ERROR_ROUTE, requestWithUrlAndMethod, response);
            Router.writeResponse(serverErrorResponseData, serverErrorResponseHeaders, response);
            return;
        }

        // FUTURE: multi-route matching (how to handle?)
        const routesMatchingPath = this.routes.filter((route) => {
            if(!route.path){
                return true;
            }
            if(typeof route.path === 'string'){
                return urlPath === route.path;
            }
            return route.path.test(urlPath);
        });

        console.info('routes matching path:', routesMatchingPath.length);

        // not found route by default, only search for matching route if
        // there are path matches to search
        let firstMatchRoute = NOT_FOUND_ROUTE;
        if(routesMatchingPath.length > 0) {
            // matched by path, find by method from those matches.
            // if no match then route found but method invalid
            firstMatchRoute = routesMatchingPath.find((route) => {
                if(typeof route.allowedMethods === 'string'){
                    return route.allowedMethods === requestWithUrlAndMethod.method;
                }
                return route.allowedMethods.includes(requestWithUrlAndMethod.method);
            }) ?? METHOD_NOT_ALLOWED_ROUTE;
        }

        console.info('matched route', JSON.stringify(firstMatchRoute, ROUTE_JSON_REPLACER, 2));

        try {
            const data = await firstMatchRoute.getData(requestWithUrlAndMethod, response);
            const headers = await Router.getHeaders(firstMatchRoute, requestWithUrlAndMethod, response);
            Router.writeResponse(data, headers, response);
        } catch (ex) {
            console.error(ex);
            const serverErrorResponseData = await SERVER_ERROR_ROUTE.getData(requestWithUrlAndMethod, response);
            const serverErrorResponseHeaders = await Router.getHeaders(SERVER_ERROR_ROUTE, requestWithUrlAndMethod, response);
            Router.writeResponse(serverErrorResponseData, serverErrorResponseHeaders, response);
        }
    }
}