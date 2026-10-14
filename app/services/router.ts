import { IncomingMessage } from 'http';
import type { RouteRequest, RouteResponse } from '../types/request.ts';
import type { HandlerResponse } from '../types/handler-response.ts';
import { DEFAULT_RESPONSE_HEADERS } from '../constants/http.ts';
import { ROUTE_METADATA_SYMBOL } from '../constants/routes.ts';
import { HandlerMethod, RouteMetadata } from '../types/route.ts';
import { IRouter } from './interfaces/router.ts';

export abstract class Router implements IRouter {
    protected readBody(req: RouteRequest): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
            req.on('error', reject);
        });
    }

    private notFound(req: RouteRequest): HandlerResponse {
        return { status: 404, content: `No route matches URL: ${req.url}` };
    }

    private methodNotAllowed(req: RouteRequest): HandlerResponse {
        return { status: 405, content: `Method ${req.method} not allowed on route: ${req.url}` };
    }

    private serverError(req: RouteRequest): HandlerResponse {
        return { status: 500, content: `Error handling method ${req.method} on route: ${req.url}` };
    }

    private static writeResponse(result: HandlerResponse, response: RouteResponse) {
        response.writeHead(result.status ?? 200, result.headers ?? DEFAULT_RESPONSE_HEADERS);
        response.end(result.content);
    }

    private getRouteMetadata(): RouteMetadata[] {
        return Object.getPrototypeOf(this)[ROUTE_METADATA_SYMBOL] ?? [];
    }

    async handleRoute(request: IncomingMessage, response: RouteResponse) {
        const req = request as RouteRequest;

        if (!req.url || !req.method) {
            Router.writeResponse(this.serverError(req), response);
            return;
        }

        const routes = this.getRouteMetadata();

        const pathMatches = routes.filter(r => {
            if (typeof r.path === 'string') return req.url === r.path;
            return r.path.test(req.url);
        });

        console.info('routes matching path:', pathMatches.length);

        if (pathMatches.length === 0) {
            Router.writeResponse(this.notFound(req), response);
            return;
        }

        const match = pathMatches.find(r => r.httpMethod === req.method);
        if (!match) {
            Router.writeResponse(this.methodNotAllowed(req), response);
            return;
        }

        console.info('matched route handler:', match.handlerKey);

        try {
            const handler = (this as Object as Record<string, HandlerMethod>)[match.handlerKey];
            const result = await handler.call(this, req, response);
            Router.writeResponse(result, response);
        } catch (ex) {
            console.error(ex);
            Router.writeResponse(this.serverError(req), response);
        }
    }
}
