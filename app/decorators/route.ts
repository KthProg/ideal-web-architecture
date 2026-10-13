import { ROUTE_METADATA_SYMBOL } from '../constants/routes.ts';
import type { HTTP_METHOD } from '../types/request.ts';
import { RouteMetadata } from '../types/route.ts';

function route(httpMethod: HTTP_METHOD, path: string | RegExp) {
    return function (_target: unknown, context: ClassMethodDecoratorContext) {
        context.addInitializer(function (this: any) {
            const proto = Object.getPrototypeOf(this);
            if (!Object.prototype.hasOwnProperty.call(proto, ROUTE_METADATA_SYMBOL)) {
                proto[ROUTE_METADATA_SYMBOL] = [];
            }
            const key = String(context.name);
            const existing: RouteMetadata[] = proto[ROUTE_METADATA_SYMBOL];
            if (!existing.some(r => r.handlerKey === key && r.httpMethod === httpMethod && String(r.path) === String(path))) {
                existing.push({ httpMethod, path, handlerKey: key });
            }
        });
    };
}

export const Get = (path: string | RegExp) => route('GET', path);
export const Post = (path: string | RegExp) => route('POST', path);
export const Put = (path: string | RegExp) => route('PUT', path);
export const Options = (path: string | RegExp) => route('OPTIONS', path);
