import { compose } from './compose.ts';
import { Context } from './context.ts';
import { HTTPException } from './http-exception.ts';
import { METHOD_NAME_ALL, METHOD_NAME_ALL_LOWERCASE, METHODS } from './router.ts';
import { RegExpRouter } from './router/reg-exp-router/index.ts';
import { SmartRouter } from './router/smart-router/index.ts';
import { TrieRouter } from './router/trie-router/index.ts';
import { getPathFromURL, mergePath } from './utils/url.ts';
function defineDynamicClass() {
    return class {
    };
}
const notFoundHandler = (c)=>{
    return c.text('404 Not Found', 404);
};
const errorHandler = (err, c)=>{
    if (err instanceof HTTPException) {
        return err.getResponse();
    }
    console.trace(err);
    const message = 'Internal Server Error';
    return c.text(message, 500);
};
export class Hono extends defineDynamicClass() {
    router = new SmartRouter({
        routers: [
            new RegExpRouter(),
            new TrieRouter()
        ]
    });
    strict = true // strict routing - default is true
    ;
    _basePath = '';
    path = '*';
    routes = [];
    constructor(init = {}){
        super();
        // Implementation of app.get(...handlers[]) or app.get(path, ...handlers[])
        const allMethods = [
            ...METHODS,
            METHOD_NAME_ALL_LOWERCASE
        ];
        allMethods.map((method)=>{
            this[method] = (args1, ...args)=>{
                if (typeof args1 === 'string') {
                    this.path = args1;
                } else {
                    this.addRoute(method, this.path, args1);
                }
                args.map((handler)=>{
                    if (typeof handler !== 'string') {
                        this.addRoute(method, this.path, handler);
                    }
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return this;
            };
        });
        // Implementation of app.on(method, path, ...handlers[])
        this.on = (method, path, ...handlers)=>{
            if (!method) return this;
            this.path = path;
            for (const m of [
                method
            ].flat()){
                handlers.map((handler)=>{
                    this.addRoute(m.toUpperCase(), this.path, handler);
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return this;
        };
        // Implementation of app.use(...handlers[]) or app.get(path, ...handlers[])
        this.use = (arg1, ...handlers)=>{
            if (typeof arg1 === 'string') {
                this.path = arg1;
            } else {
                handlers.unshift(arg1);
            }
            handlers.map((handler)=>{
                this.addRoute(METHOD_NAME_ALL, this.path, handler);
            });
            return this;
        };
        Object.assign(this, init);
    }
    clone() {
        const clone = new Hono({
            router: this.router,
            strict: this.strict
        });
        clone.routes = this.routes;
        return clone;
    }
    notFoundHandler = notFoundHandler;
    errorHandler = errorHandler;
    route(path, app) {
        const subApp = this.basePath(path);
        if (!app) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return subApp;
        }
        app.routes.map((r)=>{
            const handler = app.errorHandler === errorHandler ? r.handler : async (c, next)=>(await compose([
                    r.handler
                ], app.errorHandler)(c, next)).res;
            subApp.addRoute(r.method, r.path, handler);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this;
    }
    basePath(path) {
        const subApp = this.clone();
        subApp._basePath = mergePath(this._basePath, path);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return subApp;
    }
    onError(handler) {
        this.errorHandler = handler;
        return this;
    }
    notFound(handler) {
        this.notFoundHandler = handler;
        return this;
    }
    showRoutes() {
        const length = 8;
        this.routes.map((route)=>{
            console.log(`\x1b[32m${route.method}\x1b[0m ${' '.repeat(length - route.method.length)} ${route.path}`);
        });
    }
    addRoute(method, path, handler) {
        method = method.toUpperCase();
        if (this._basePath) {
            path = mergePath(this._basePath, path);
        }
        this.router.add(method, path, handler);
        const r = {
            path: path,
            method: method,
            handler: handler
        };
        this.routes.push(r);
    }
    matchRoute(method, path) {
        return this.router.match(method, path);
    }
    handleError(err, c) {
        if (err instanceof Error) {
            return this.errorHandler(err, c);
        }
        throw err;
    }
    dispatch(request, eventOrExecutionCtx, env) {
        const path = getPathFromURL(request.url, this.strict);
        const method = request.method;
        const result = this.matchRoute(method, path);
        const paramData = result?.params;
        const c = new Context(request, {
            env,
            executionCtx: eventOrExecutionCtx,
            notFoundHandler: this.notFoundHandler,
            path,
            paramData
        });
        // Do not `compose` if it has only one handler
        if (result?.handlers.length === 1) {
            const handler = result.handlers[0];
            let res;
            try {
                res = handler(c, async ()=>{});
                if (!res) {
                    return this.notFoundHandler(c);
                }
            } catch (err) {
                return this.handleError(err, c);
            }
            if (res instanceof Response) return res;
            if ('response' in res) {
                res = res.response;
            }
            if (res instanceof Response) return res;
            return (async ()=>{
                let awaited;
                try {
                    awaited = await res;
                    if (awaited !== undefined && 'response' in awaited) {
                        awaited = awaited['response'];
                    }
                    if (!awaited) {
                        return this.notFoundHandler(c);
                    }
                } catch (err) {
                    return this.handleError(err, c);
                }
                return awaited;
            })();
        }
        const handlers = result ? result.handlers : [
            this.notFoundHandler
        ];
        const composed = compose(handlers, this.errorHandler, this.notFoundHandler);
        return (async ()=>{
            try {
                const tmp = composed(c);
                const context = tmp instanceof Promise ? await tmp : tmp;
                if (!context.finalized) {
                    throw new Error('Context is not finalized. You may forget returning Response object or `await next()`');
                }
                return context.res;
            } catch (err) {
                return this.handleError(err, c);
            }
        })();
    }
    handleEvent = (event)=>{
        return this.dispatch(event.request, event);
    };
    fetch = (request, Env, executionCtx)=>{
        return this.dispatch(request, executionCtx, Env);
    };
    request = async (input, requestInit)=>{
        if (input instanceof Request) {
            if (requestInit !== undefined) {
                input = new Request(input, requestInit);
            }
            return await this.fetch(input);
        }
        input = input.toString();
        const path = /^https?:\/\//.test(input) ? input : `http://localhost${mergePath('/', input)}`;
        const req = new Request(path, requestInit);
        return await this.fetch(req);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvaG9uby50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21wb3NlIH0gZnJvbSAnLi9jb21wb3NlLnRzJ1xuaW1wb3J0IHsgQ29udGV4dCB9IGZyb20gJy4vY29udGV4dC50cydcbmltcG9ydCB0eXBlIHsgRXhlY3V0aW9uQ29udGV4dCB9IGZyb20gJy4vY29udGV4dC50cydcbmltcG9ydCB7IEhUVFBFeGNlcHRpb24gfSBmcm9tICcuL2h0dHAtZXhjZXB0aW9uLnRzJ1xuaW1wb3J0IHR5cGUgeyBSb3V0ZXIgfSBmcm9tICcuL3JvdXRlci50cydcbmltcG9ydCB7IE1FVEhPRF9OQU1FX0FMTCwgTUVUSE9EX05BTUVfQUxMX0xPV0VSQ0FTRSwgTUVUSE9EUyB9IGZyb20gJy4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgUmVnRXhwUm91dGVyIH0gZnJvbSAnLi9yb3V0ZXIvcmVnLWV4cC1yb3V0ZXIvaW5kZXgudHMnXG5pbXBvcnQgeyBTbWFydFJvdXRlciB9IGZyb20gJy4vcm91dGVyL3NtYXJ0LXJvdXRlci9pbmRleC50cydcbmltcG9ydCB7IFRyaWVSb3V0ZXIgfSBmcm9tICcuL3JvdXRlci90cmllLXJvdXRlci9pbmRleC50cydcbmltcG9ydCB0eXBlIHtcbiAgRW52LFxuICBFcnJvckhhbmRsZXIsXG4gIEgsXG4gIEhhbmRsZXJJbnRlcmZhY2UsXG4gIE1pZGRsZXdhcmVIYW5kbGVyLFxuICBNaWRkbGV3YXJlSGFuZGxlckludGVyZmFjZSxcbiAgTmV4dCxcbiAgTm90Rm91bmRIYW5kbGVyLFxuICBPbkhhbmRsZXJJbnRlcmZhY2UsXG4gIFR5cGVkUmVzcG9uc2UsXG4gIE1lcmdlUGF0aCxcbiAgTWVyZ2VTY2hlbWFQYXRoLFxufSBmcm9tICcuL3R5cGVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBSZW1vdmVCbGFua1JlY29yZCB9IGZyb20gJy4vdXRpbHMvdHlwZXMudHMnXG5pbXBvcnQgeyBnZXRQYXRoRnJvbVVSTCwgbWVyZ2VQYXRoIH0gZnJvbSAnLi91dGlscy91cmwudHMnXG5cbnR5cGUgTWV0aG9kcyA9IHR5cGVvZiBNRVRIT0RTW251bWJlcl0gfCB0eXBlb2YgTUVUSE9EX05BTUVfQUxMX0xPV0VSQ0FTRVxuXG5pbnRlcmZhY2UgUm91dGVyUm91dGUge1xuICBwYXRoOiBzdHJpbmdcbiAgbWV0aG9kOiBzdHJpbmdcbiAgaGFuZGxlcjogSFxufVxuXG5mdW5jdGlvbiBkZWZpbmVEeW5hbWljQ2xhc3MoKToge1xuICBuZXcgPEUgZXh0ZW5kcyBFbnYgPSBFbnYsIFMgPSB7fSwgQmFzZVBhdGggZXh0ZW5kcyBzdHJpbmcgPSAnJz4oKToge1xuICAgIFtNIGluIE1ldGhvZHNdOiBIYW5kbGVySW50ZXJmYWNlPEUsIE0sIFMsIEJhc2VQYXRoPlxuICB9ICYge1xuICAgIG9uOiBPbkhhbmRsZXJJbnRlcmZhY2U8RSwgUywgQmFzZVBhdGg+XG4gIH0gJiB7XG4gICAgdXNlOiBNaWRkbGV3YXJlSGFuZGxlckludGVyZmFjZTxFLCBTLCBCYXNlUGF0aD5cbiAgfVxufSB7XG4gIHJldHVybiBjbGFzcyB7fSBhcyBuZXZlclxufVxuXG5jb25zdCBub3RGb3VuZEhhbmRsZXIgPSAoYzogQ29udGV4dCkgPT4ge1xuICByZXR1cm4gYy50ZXh0KCc0MDQgTm90IEZvdW5kJywgNDA0KVxufVxuXG5jb25zdCBlcnJvckhhbmRsZXIgPSAoZXJyOiBFcnJvciwgYzogQ29udGV4dCkgPT4ge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgSFRUUEV4Y2VwdGlvbikge1xuICAgIHJldHVybiBlcnIuZ2V0UmVzcG9uc2UoKVxuICB9XG4gIGNvbnNvbGUudHJhY2UoZXJyKVxuICBjb25zdCBtZXNzYWdlID0gJ0ludGVybmFsIFNlcnZlciBFcnJvcidcbiAgcmV0dXJuIGMudGV4dChtZXNzYWdlLCA1MDApXG59XG5cbmV4cG9ydCBjbGFzcyBIb25vPFxuICBFIGV4dGVuZHMgRW52ID0gRW52LFxuICBTID0ge30sXG4gIEJhc2VQYXRoIGV4dGVuZHMgc3RyaW5nID0gJydcbj4gZXh0ZW5kcyBkZWZpbmVEeW5hbWljQ2xhc3MoKTxFLCBTLCBCYXNlUGF0aD4ge1xuICByZWFkb25seSByb3V0ZXI6IFJvdXRlcjxIPiA9IG5ldyBTbWFydFJvdXRlcih7XG4gICAgcm91dGVyczogW25ldyBSZWdFeHBSb3V0ZXIoKSwgbmV3IFRyaWVSb3V0ZXIoKV0sXG4gIH0pXG4gIHJlYWRvbmx5IHN0cmljdDogYm9vbGVhbiA9IHRydWUgLy8gc3RyaWN0IHJvdXRpbmcgLSBkZWZhdWx0IGlzIHRydWVcbiAgcHJpdmF0ZSBfYmFzZVBhdGg6IHN0cmluZyA9ICcnXG4gIHByaXZhdGUgcGF0aDogc3RyaW5nID0gJyonXG5cbiAgcm91dGVzOiBSb3V0ZXJSb3V0ZVtdID0gW11cblxuICBjb25zdHJ1Y3Rvcihpbml0OiBQYXJ0aWFsPFBpY2s8SG9ubywgJ3JvdXRlcicgfCAnc3RyaWN0Jz4+ID0ge30pIHtcbiAgICBzdXBlcigpXG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiBhcHAuZ2V0KC4uLmhhbmRsZXJzW10pIG9yIGFwcC5nZXQocGF0aCwgLi4uaGFuZGxlcnNbXSlcbiAgICBjb25zdCBhbGxNZXRob2RzID0gWy4uLk1FVEhPRFMsIE1FVEhPRF9OQU1FX0FMTF9MT1dFUkNBU0VdXG4gICAgYWxsTWV0aG9kcy5tYXAoKG1ldGhvZCkgPT4ge1xuICAgICAgdGhpc1ttZXRob2RdID0gKGFyZ3MxOiBzdHJpbmcgfCBILCAuLi5hcmdzOiBIW10pID0+IHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzMSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLnBhdGggPSBhcmdzMVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuYWRkUm91dGUobWV0aG9kLCB0aGlzLnBhdGgsIGFyZ3MxKVxuICAgICAgICB9XG4gICAgICAgIGFyZ3MubWFwKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5hZGRSb3V0ZShtZXRob2QsIHRoaXMucGF0aCwgaGFuZGxlcilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgIHJldHVybiB0aGlzIGFzIGFueVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiBhcHAub24obWV0aG9kLCBwYXRoLCAuLi5oYW5kbGVyc1tdKVxuICAgIHRoaXMub24gPSAobWV0aG9kOiBzdHJpbmcgfCBzdHJpbmdbXSwgcGF0aDogc3RyaW5nLCAuLi5oYW5kbGVyczogSFtdKSA9PiB7XG4gICAgICBpZiAoIW1ldGhvZCkgcmV0dXJuIHRoaXNcbiAgICAgIHRoaXMucGF0aCA9IHBhdGhcbiAgICAgIGZvciAoY29uc3QgbSBvZiBbbWV0aG9kXS5mbGF0KCkpIHtcbiAgICAgICAgaGFuZGxlcnMubWFwKChoYW5kbGVyKSA9PiB7XG4gICAgICAgICAgdGhpcy5hZGRSb3V0ZShtLnRvVXBwZXJDYXNlKCksIHRoaXMucGF0aCwgaGFuZGxlcilcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICByZXR1cm4gdGhpcyBhcyBhbnlcbiAgICB9XG5cbiAgICAvLyBJbXBsZW1lbnRhdGlvbiBvZiBhcHAudXNlKC4uLmhhbmRsZXJzW10pIG9yIGFwcC5nZXQocGF0aCwgLi4uaGFuZGxlcnNbXSlcbiAgICB0aGlzLnVzZSA9IChhcmcxOiBzdHJpbmcgfCBNaWRkbGV3YXJlSGFuZGxlciwgLi4uaGFuZGxlcnM6IE1pZGRsZXdhcmVIYW5kbGVyW10pID0+IHtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5wYXRoID0gYXJnMVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlcnMudW5zaGlmdChhcmcxKVxuICAgICAgfVxuICAgICAgaGFuZGxlcnMubWFwKChoYW5kbGVyKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkUm91dGUoTUVUSE9EX05BTUVfQUxMLCB0aGlzLnBhdGgsIGhhbmRsZXIpXG4gICAgICB9KVxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKHRoaXMsIGluaXQpXG4gIH1cblxuICBwcml2YXRlIGNsb25lKCk6IEhvbm88RSwgUywgQmFzZVBhdGg+IHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBIb25vPEUsIFMsIEJhc2VQYXRoPih7XG4gICAgICByb3V0ZXI6IHRoaXMucm91dGVyLFxuICAgICAgc3RyaWN0OiB0aGlzLnN0cmljdCxcbiAgICB9KVxuICAgIGNsb25lLnJvdXRlcyA9IHRoaXMucm91dGVzXG4gICAgcmV0dXJuIGNsb25lXG4gIH1cblxuICBwcml2YXRlIG5vdEZvdW5kSGFuZGxlcjogTm90Rm91bmRIYW5kbGVyID0gbm90Rm91bmRIYW5kbGVyXG4gIHByaXZhdGUgZXJyb3JIYW5kbGVyOiBFcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXJcblxuICByb3V0ZTxTdWJQYXRoIGV4dGVuZHMgc3RyaW5nLCBTdWJFbnYgZXh0ZW5kcyBFbnYsIFN1YlNjaGVtYSwgU3ViQmFzZVBhdGggZXh0ZW5kcyBzdHJpbmc+KFxuICAgIHBhdGg6IFN1YlBhdGgsXG4gICAgYXBwOiBIb25vPFN1YkVudiwgU3ViU2NoZW1hLCBTdWJCYXNlUGF0aD5cbiAgKTogSG9ubzxFLCBSZW1vdmVCbGFua1JlY29yZDxNZXJnZVNjaGVtYVBhdGg8U3ViU2NoZW1hLCBTdWJQYXRoPiB8IFM+LCBCYXNlUGF0aD5cbiAgLyoqIEBkZXByZWNhdGVkXG4gICAqIFVzZSBgYmFzZVBhdGhgIGluc3RlYWQgb2YgYHJvdXRlYCB3aXRoIG9uZSBhcmd1bWVudC5cbiAgICogVGhlIGByb3V0ZWAgd2l0aCBvbmUgYXJndW1lbnQgaGFzIGJlZW4gcmVtb3ZlZCBpbiB2NC5cbiAgICovXG4gIHJvdXRlPFN1YlBhdGggZXh0ZW5kcyBzdHJpbmc+KHBhdGg6IFN1YlBhdGgpOiBIb25vPEUsIFJlbW92ZUJsYW5rUmVjb3JkPFM+LCBCYXNlUGF0aD5cbiAgcm91dGU8U3ViUGF0aCBleHRlbmRzIHN0cmluZywgU3ViRW52IGV4dGVuZHMgRW52LCBTdWJTY2hlbWEsIFN1YkJhc2VQYXRoIGV4dGVuZHMgc3RyaW5nPihcbiAgICBwYXRoOiBTdWJQYXRoLFxuICAgIGFwcD86IEhvbm88U3ViRW52LCBTdWJTY2hlbWEsIFN1YkJhc2VQYXRoPlxuICApOiBIb25vPEUsIFJlbW92ZUJsYW5rUmVjb3JkPE1lcmdlU2NoZW1hUGF0aDxTdWJTY2hlbWEsIFN1YlBhdGg+IHwgUz4sIEJhc2VQYXRoPiB7XG4gICAgY29uc3Qgc3ViQXBwID0gdGhpcy5iYXNlUGF0aChwYXRoKVxuXG4gICAgaWYgKCFhcHApIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICByZXR1cm4gc3ViQXBwIGFzIGFueVxuICAgIH1cblxuICAgIGFwcC5yb3V0ZXMubWFwKChyKSA9PiB7XG4gICAgICBjb25zdCBoYW5kbGVyID1cbiAgICAgICAgYXBwLmVycm9ySGFuZGxlciA9PT0gZXJyb3JIYW5kbGVyXG4gICAgICAgICAgPyByLmhhbmRsZXJcbiAgICAgICAgICA6IGFzeW5jIChjOiBDb250ZXh0LCBuZXh0OiBOZXh0KSA9PlxuICAgICAgICAgICAgICAoYXdhaXQgY29tcG9zZTxDb250ZXh0Pihbci5oYW5kbGVyXSwgYXBwLmVycm9ySGFuZGxlcikoYywgbmV4dCkpLnJlc1xuICAgICAgc3ViQXBwLmFkZFJvdXRlKHIubWV0aG9kLCByLnBhdGgsIGhhbmRsZXIpXG4gICAgfSlcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIHJldHVybiB0aGlzIGFzIGFueVxuICB9XG5cbiAgYmFzZVBhdGg8U3ViUGF0aCBleHRlbmRzIHN0cmluZz4ocGF0aDogU3ViUGF0aCk6IEhvbm88RSwgUywgTWVyZ2VQYXRoPEJhc2VQYXRoLCBTdWJQYXRoPj4ge1xuICAgIGNvbnN0IHN1YkFwcCA9IHRoaXMuY2xvbmUoKVxuICAgIHN1YkFwcC5fYmFzZVBhdGggPSBtZXJnZVBhdGgodGhpcy5fYmFzZVBhdGgsIHBhdGgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICByZXR1cm4gc3ViQXBwIGFzIGFueVxuICB9XG5cbiAgb25FcnJvcihoYW5kbGVyOiBFcnJvckhhbmRsZXI8RT4pIHtcbiAgICB0aGlzLmVycm9ySGFuZGxlciA9IGhhbmRsZXJcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgbm90Rm91bmQoaGFuZGxlcjogTm90Rm91bmRIYW5kbGVyPEU+KSB7XG4gICAgdGhpcy5ub3RGb3VuZEhhbmRsZXIgPSBoYW5kbGVyXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNob3dSb3V0ZXMoKSB7XG4gICAgY29uc3QgbGVuZ3RoID0gOFxuICAgIHRoaXMucm91dGVzLm1hcCgocm91dGUpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgXFx4MWJbMzJtJHtyb3V0ZS5tZXRob2R9XFx4MWJbMG0gJHsnICcucmVwZWF0KGxlbmd0aCAtIHJvdXRlLm1ldGhvZC5sZW5ndGgpfSAke3JvdXRlLnBhdGh9YFxuICAgICAgKVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGFkZFJvdXRlKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IEgpIHtcbiAgICBtZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIGlmICh0aGlzLl9iYXNlUGF0aCkge1xuICAgICAgcGF0aCA9IG1lcmdlUGF0aCh0aGlzLl9iYXNlUGF0aCwgcGF0aClcbiAgICB9XG4gICAgdGhpcy5yb3V0ZXIuYWRkKG1ldGhvZCwgcGF0aCwgaGFuZGxlcilcbiAgICBjb25zdCByOiBSb3V0ZXJSb3V0ZSA9IHsgcGF0aDogcGF0aCwgbWV0aG9kOiBtZXRob2QsIGhhbmRsZXI6IGhhbmRsZXIgfVxuICAgIHRoaXMucm91dGVzLnB1c2gocilcbiAgfVxuXG4gIHByaXZhdGUgbWF0Y2hSb3V0ZShtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMucm91dGVyLm1hdGNoKG1ldGhvZCwgcGF0aClcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlRXJyb3IoZXJyOiB1bmtub3duLCBjOiBDb250ZXh0PEU+KSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gdGhpcy5lcnJvckhhbmRsZXIoZXJyLCBjKVxuICAgIH1cbiAgICB0aHJvdyBlcnJcbiAgfVxuXG4gIHByaXZhdGUgZGlzcGF0Y2goXG4gICAgcmVxdWVzdDogUmVxdWVzdCxcbiAgICBldmVudE9yRXhlY3V0aW9uQ3R4PzogRXhlY3V0aW9uQ29udGV4dCB8IEZldGNoRXZlbnQsXG4gICAgZW52PzogRVsnQmluZGluZ3MnXVxuICApOiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+IHtcbiAgICBjb25zdCBwYXRoID0gZ2V0UGF0aEZyb21VUkwocmVxdWVzdC51cmwsIHRoaXMuc3RyaWN0KVxuICAgIGNvbnN0IG1ldGhvZCA9IHJlcXVlc3QubWV0aG9kXG5cbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLm1hdGNoUm91dGUobWV0aG9kLCBwYXRoKVxuICAgIGNvbnN0IHBhcmFtRGF0YSA9IHJlc3VsdD8ucGFyYW1zXG5cbiAgICBjb25zdCBjID0gbmV3IENvbnRleHQocmVxdWVzdCwge1xuICAgICAgZW52LFxuICAgICAgZXhlY3V0aW9uQ3R4OiBldmVudE9yRXhlY3V0aW9uQ3R4LFxuICAgICAgbm90Rm91bmRIYW5kbGVyOiB0aGlzLm5vdEZvdW5kSGFuZGxlcixcbiAgICAgIHBhdGgsXG4gICAgICBwYXJhbURhdGEsXG4gICAgfSlcblxuICAgIC8vIERvIG5vdCBgY29tcG9zZWAgaWYgaXQgaGFzIG9ubHkgb25lIGhhbmRsZXJcbiAgICBpZiAocmVzdWx0Py5oYW5kbGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSByZXN1bHQuaGFuZGxlcnNbMF1cbiAgICAgIGxldCByZXM6IFJldHVyblR5cGU8SD5cblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzID0gaGFuZGxlcihjLCBhc3luYyAoKSA9PiB7fSlcbiAgICAgICAgaWYgKCFyZXMpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIoYylcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcyBpbnN0YW5jZW9mIFJlc3BvbnNlKSByZXR1cm4gcmVzXG5cbiAgICAgIGlmICgncmVzcG9uc2UnIGluIHJlcykge1xuICAgICAgICByZXMgPSByZXMucmVzcG9uc2VcbiAgICAgIH1cblxuICAgICAgaWYgKHJlcyBpbnN0YW5jZW9mIFJlc3BvbnNlKSByZXR1cm4gcmVzXG5cbiAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBsZXQgYXdhaXRlZDogUmVzcG9uc2UgfCBUeXBlZFJlc3BvbnNlIHwgdm9pZFxuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0ZWQgPSBhd2FpdCByZXNcbiAgICAgICAgICBpZiAoYXdhaXRlZCAhPT0gdW5kZWZpbmVkICYmICdyZXNwb25zZScgaW4gYXdhaXRlZCkge1xuICAgICAgICAgICAgYXdhaXRlZCA9IGF3YWl0ZWRbJ3Jlc3BvbnNlJ10gYXMgUmVzcG9uc2VcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFhd2FpdGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub3RGb3VuZEhhbmRsZXIoYylcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJldHVybiB0aGlzLmhhbmRsZUVycm9yKGVyciwgYylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXRlZFxuICAgICAgfSkoKVxuICAgIH1cblxuICAgIGNvbnN0IGhhbmRsZXJzID0gcmVzdWx0ID8gcmVzdWx0LmhhbmRsZXJzIDogW3RoaXMubm90Rm91bmRIYW5kbGVyXVxuICAgIGNvbnN0IGNvbXBvc2VkID0gY29tcG9zZTxDb250ZXh0PihoYW5kbGVycywgdGhpcy5lcnJvckhhbmRsZXIsIHRoaXMubm90Rm91bmRIYW5kbGVyKVxuXG4gICAgcmV0dXJuIChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB0bXAgPSBjb21wb3NlZChjKVxuICAgICAgICBjb25zdCBjb250ZXh0ID0gdG1wIGluc3RhbmNlb2YgUHJvbWlzZSA/IGF3YWl0IHRtcCA6IHRtcFxuICAgICAgICBpZiAoIWNvbnRleHQuZmluYWxpemVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0NvbnRleHQgaXMgbm90IGZpbmFsaXplZC4gWW91IG1heSBmb3JnZXQgcmV0dXJuaW5nIFJlc3BvbnNlIG9iamVjdCBvciBgYXdhaXQgbmV4dCgpYCdcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbnRleHQucmVzXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlRXJyb3IoZXJyLCBjKVxuICAgICAgfVxuICAgIH0pKClcbiAgfVxuXG4gIGhhbmRsZUV2ZW50ID0gKGV2ZW50OiBGZXRjaEV2ZW50KSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGF0Y2goZXZlbnQucmVxdWVzdCwgZXZlbnQpXG4gIH1cblxuICBmZXRjaCA9IChyZXF1ZXN0OiBSZXF1ZXN0LCBFbnY/OiBFWydCaW5kaW5ncyddIHwge30sIGV4ZWN1dGlvbkN0eD86IEV4ZWN1dGlvbkNvbnRleHQpID0+IHtcbiAgICByZXR1cm4gdGhpcy5kaXNwYXRjaChyZXF1ZXN0LCBleGVjdXRpb25DdHgsIEVudilcbiAgfVxuXG4gIHJlcXVlc3QgPSBhc3luYyAoaW5wdXQ6IFJlcXVlc3QgfCBzdHJpbmcgfCBVUkwsIHJlcXVlc3RJbml0PzogUmVxdWVzdEluaXQpID0+IHtcbiAgICBpZiAoaW5wdXQgaW5zdGFuY2VvZiBSZXF1ZXN0KSB7XG4gICAgICBpZiAocmVxdWVzdEluaXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpbnB1dCA9IG5ldyBSZXF1ZXN0KGlucHV0LCByZXF1ZXN0SW5pdClcbiAgICAgIH1cbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmZldGNoKGlucHV0KVxuICAgIH1cbiAgICBpbnB1dCA9IGlucHV0LnRvU3RyaW5nKClcbiAgICBjb25zdCBwYXRoID0gL15odHRwcz86XFwvXFwvLy50ZXN0KGlucHV0KSA/IGlucHV0IDogYGh0dHA6Ly9sb2NhbGhvc3Qke21lcmdlUGF0aCgnLycsIGlucHV0KX1gXG4gICAgY29uc3QgcmVxID0gbmV3IFJlcXVlc3QocGF0aCwgcmVxdWVzdEluaXQpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZmV0Y2gocmVxKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxPQUFPLFFBQVEsZUFBYztBQUN0QyxTQUFTLE9BQU8sUUFBUSxlQUFjO0FBRXRDLFNBQVMsYUFBYSxRQUFRLHNCQUFxQjtBQUVuRCxTQUFTLGVBQWUsRUFBRSx5QkFBeUIsRUFBRSxPQUFPLFFBQVEsY0FBYTtBQUNqRixTQUFTLFlBQVksUUFBUSxtQ0FBa0M7QUFDL0QsU0FBUyxXQUFXLFFBQVEsaUNBQWdDO0FBQzVELFNBQVMsVUFBVSxRQUFRLGdDQUErQjtBQWdCMUQsU0FBUyxjQUFjLEVB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