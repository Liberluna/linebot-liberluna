import { HonoRequest } from './request.ts';
import { serialize } from './utils/cookie.ts';
export class Context {
    env = {};
    finalized = false;
    error = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _req;
    _status = 200;
    _executionCtx;
    _pretty = false;
    _prettySpace = 2;
    _map;
    _headers = undefined;
    _preparedHeaders = undefined;
    _res;
    _path = '/';
    _paramData;
    rawRequest;
    notFoundHandler = ()=>new Response();
    constructor(req, options){
        this.rawRequest = req;
        if (options) {
            this._executionCtx = options.executionCtx;
            this._path = options.path ?? '/';
            this._paramData = options.paramData;
            this.env = options.env;
            if (options.notFoundHandler) {
                this.notFoundHandler = options.notFoundHandler;
            }
        }
    }
    get req() {
        if (this._req) {
            return this._req;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._req = new HonoRequest(this.rawRequest, this._path, this._paramData);
            this.rawRequest = undefined;
            this._paramData = undefined;
            return this._req;
        }
    }
    get event() {
        if (this._executionCtx instanceof FetchEvent) {
            return this._executionCtx;
        } else {
            throw Error('This context has no FetchEvent');
        }
    }
    get executionCtx() {
        if (this._executionCtx) {
            return this._executionCtx;
        } else {
            throw Error('This context has no ExecutionContext');
        }
    }
    get res() {
        return this._res ||= new Response('404 Not Found', {
            status: 404
        });
    }
    set res(_res) {
        if (this._res && _res) {
            this._res.headers.delete('content-type');
            this._res.headers.forEach((v, k)=>{
                _res.headers.set(k, v);
            });
        }
        this._res = _res;
        this.finalized = true;
    }
    header = (name, value, options)=>{
        if (options?.append) {
            if (!this._headers) {
                this._headers = new Headers(this._preparedHeaders);
                this._preparedHeaders = {};
            }
            this._headers.append(name, value);
        } else {
            if (this._headers) {
                this._headers.set(name, value);
            } else {
                this._preparedHeaders ??= {};
                this._preparedHeaders[name.toLowerCase()] = value;
            }
        }
        if (this.finalized) {
            if (options?.append) {
                this.res.headers.append(name, value);
            } else {
                this.res.headers.set(name, value);
            }
        }
    };
    status = (status)=>{
        this._status = status;
    };
    set = (key, value)=>{
        this._map ||= {};
        this._map[key] = value;
    };
    get = (key)=>{
        return this._map?.[key];
    };
    pretty = (prettyJSON, space = 2)=>{
        this._pretty = prettyJSON;
        this._prettySpace = space;
    };
    newResponse = (data, arg, headers)=>{
        // Optimized
        if (!headers && !this._headers && !this._res && !arg && this._status === 200) {
            return new Response(data, {
                headers: this._preparedHeaders
            });
        }
        // Return Response immediately if arg is RequestInit.
        if (arg && typeof arg !== 'number') {
            const res = new Response(data, arg);
            const contentType = this._preparedHeaders?.['content-type'];
            if (contentType) {
                res.headers.set('content-type', contentType);
            }
            return res;
        }
        const status = arg ?? this._status;
        this._preparedHeaders ??= {};
        this._headers ??= new Headers();
        for (const [k, v] of Object.entries(this._preparedHeaders)){
            this._headers.set(k, v);
        }
        if (this._res) {
            this._res.headers.forEach((v, k)=>{
                this._headers?.set(k, v);
            });
            for (const [k1, v1] of Object.entries(this._preparedHeaders)){
                this._headers.set(k1, v1);
            }
        }
        headers ??= {};
        for (const [k2, v2] of Object.entries(headers)){
            if (typeof v2 === 'string') {
                this._headers.set(k2, v2);
            } else {
                this._headers.delete(k2);
                for (const v21 of v2){
                    this._headers.append(k2, v21);
                }
            }
        }
        return new Response(data, {
            status,
            headers: this._headers
        });
    };
    body = (data, arg, headers)=>{
        return typeof arg === 'number' ? this.newResponse(data, arg, headers) : this.newResponse(data, arg);
    };
    text = (text, arg, headers)=>{
        // If the header is empty, return Response immediately.
        // Content-Type will be added automatically as `text/plain`.
        if (!this._preparedHeaders) {
            if (!headers && !this._res && !this._headers && !arg) {
                return new Response(text);
            }
            this._preparedHeaders = {};
        }
        // If Content-Type is not set, we don't have to set `text/plain`.
        // Fewer the header values, it will be faster.
        if (this._preparedHeaders['content-type']) {
            this._preparedHeaders['content-type'] = 'text/plain; charset=UTF8';
        }
        return typeof arg === 'number' ? this.newResponse(text, arg, headers) : this.newResponse(text, arg);
    };
    json = (object, arg, headers)=>{
        const body = this._pretty ? JSON.stringify(object, null, this._prettySpace) : JSON.stringify(object);
        this._preparedHeaders ??= {};
        this._preparedHeaders['content-type'] = 'application/json; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(body, arg, headers) : this.newResponse(body, arg);
    };
    jsonT = (object, arg, headers)=>{
        return {
            response: typeof arg === 'number' ? this.json(object, arg, headers) : this.json(object, arg),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data: object,
            format: 'json'
        };
    };
    html = (html, arg, headers)=>{
        this._preparedHeaders ??= {};
        this._preparedHeaders['content-type'] = 'text/html; charset=UTF-8';
        return typeof arg === 'number' ? this.newResponse(html, arg, headers) : this.newResponse(html, arg);
    };
    redirect = (location, status = 302)=>{
        this._headers ??= new Headers();
        this._headers.set('Location', location);
        return this.newResponse(null, status);
    };
    cookie = (name, value, opt)=>{
        const cookie = serialize(name, value, opt);
        this.header('set-cookie', cookie, {
            append: true
        });
    };
    notFound = ()=>{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.notFoundHandler(this);
    };
    get runtime() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const global = globalThis;
        if (global?.Deno !== undefined) {
            return 'deno';
        }
        if (global?.Bun !== undefined) {
            return 'bun';
        }
        if (typeof global?.WebSocketPair === 'function') {
            return 'workerd';
        }
        if (typeof global?.EdgeRuntime === 'string') {
            return 'edge-light';
        }
        let onFastly = false;
        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const { env  } = require('fastly:env');
            if (env instanceof Function) onFastly = true;
        } catch  {}
        if (onFastly) {
            return 'fastly';
        }
        if (global?.__lagon__ !== undefined) {
            return 'lagon';
        }
        if (global?.process?.release?.name === 'node') {
            return 'node';
        }
        return 'other';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvY29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIb25vUmVxdWVzdCB9IGZyb20gJy4vcmVxdWVzdC50cydcbmltcG9ydCB0eXBlIHsgVHlwZWRSZXNwb25zZSB9IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IEVudiwgTm90Rm91bmRIYW5kbGVyLCBJbnB1dCB9IGZyb20gJy4vdHlwZXMudHMnXG5pbXBvcnQgdHlwZSB7IENvb2tpZU9wdGlvbnMgfSBmcm9tICcuL3V0aWxzL2Nvb2tpZS50cydcbmltcG9ydCB7IHNlcmlhbGl6ZSB9IGZyb20gJy4vdXRpbHMvY29va2llLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdGF0dXNDb2RlIH0gZnJvbSAnLi91dGlscy9odHRwLXN0YXR1cy50cydcbmltcG9ydCB0eXBlIHsgSlNPTlZhbHVlIH0gZnJvbSAnLi91dGlscy90eXBlcy50cydcblxudHlwZSBSdW50aW1lID0gJ25vZGUnIHwgJ2Rlbm8nIHwgJ2J1bicgfCAnd29ya2VyZCcgfCAnZmFzdGx5JyB8ICdlZGdlLWxpZ2h0JyB8ICdsYWdvbicgfCAnb3RoZXInXG50eXBlIEhlYWRlclJlY29yZCA9IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHN0cmluZ1tdPlxudHlwZSBEYXRhID0gc3RyaW5nIHwgQXJyYXlCdWZmZXIgfCBSZWFkYWJsZVN0cmVhbVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvbkNvbnRleHQge1xuICB3YWl0VW50aWwocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWRcbiAgcGFzc1Rocm91Z2hPbkV4Y2VwdGlvbigpOiB2b2lkXG59XG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHRWYXJpYWJsZU1hcCB7fVxuXG5pbnRlcmZhY2UgTmV3UmVzcG9uc2Uge1xuICAoZGF0YTogRGF0YSB8IG51bGwsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoZGF0YTogRGF0YSB8IG51bGwsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBSZXNwb25zZVxufVxuXG5pbnRlcmZhY2UgQm9keVJlc3BvbmQgZXh0ZW5kcyBOZXdSZXNwb25zZSB7fVxuXG5pbnRlcmZhY2UgVGV4dFJlc3BvbmQge1xuICAodGV4dDogc3RyaW5nLCBzdGF0dXM/OiBTdGF0dXNDb2RlLCBoZWFkZXJzPzogSGVhZGVyUmVjb3JkKTogUmVzcG9uc2VcbiAgKHRleHQ6IHN0cmluZywgaW5pdD86IFJlc3BvbnNlSW5pdCk6IFJlc3BvbnNlXG59XG5cbmludGVyZmFjZSBKU09OUmVzcG9uZCB7XG4gIDxUID0gSlNPTlZhbHVlPihvYmplY3Q6IFQsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICA8VCA9IEpTT05WYWx1ZT4ob2JqZWN0OiBULCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxuaW50ZXJmYWNlIEpTT05UUmVzcG9uZCB7XG4gIDxUPihcbiAgICBvYmplY3Q6IFQgZXh0ZW5kcyBKU09OVmFsdWUgPyBUIDogSlNPTlZhbHVlLFxuICAgIHN0YXR1cz86IFN0YXR1c0NvZGUsXG4gICAgaGVhZGVycz86IEhlYWRlclJlY29yZFxuICApOiBUeXBlZFJlc3BvbnNlPFQgZXh0ZW5kcyBKU09OVmFsdWUgPyAoSlNPTlZhbHVlIGV4dGVuZHMgVCA/IG5ldmVyIDogVCkgOiBuZXZlcj5cbiAgPFQ+KG9iamVjdDogVCBleHRlbmRzIEpTT05WYWx1ZSA/IFQgOiBKU09OVmFsdWUsIGluaXQ/OiBSZXNwb25zZUluaXQpOiBUeXBlZFJlc3BvbnNlPFxuICAgIFQgZXh0ZW5kcyBKU09OVmFsdWUgPyAoSlNPTlZhbHVlIGV4dGVuZHMgVCA/IG5ldmVyIDogVCkgOiBuZXZlclxuICA+XG59XG5cbmludGVyZmFjZSBIVE1MUmVzcG9uZCB7XG4gIChodG1sOiBzdHJpbmcsIHN0YXR1cz86IFN0YXR1c0NvZGUsIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmQpOiBSZXNwb25zZVxuICAoaHRtbDogc3RyaW5nLCBpbml0PzogUmVzcG9uc2VJbml0KTogUmVzcG9uc2Vcbn1cblxudHlwZSBHZXRWYXJpYWJsZTxLLCBFIGV4dGVuZHMgRW52PiA9IEsgZXh0ZW5kcyBrZXlvZiBFWydWYXJpYWJsZXMnXVxuICA/IEVbJ1ZhcmlhYmxlcyddW0tdXG4gIDogSyBleHRlbmRzIGtleW9mIENvbnRleHRWYXJpYWJsZU1hcFxuICA/IENvbnRleHRWYXJpYWJsZU1hcFtLXVxuICA6IHVua25vd25cblxudHlwZSBDb250ZXh0T3B0aW9uczxFIGV4dGVuZHMgRW52PiA9IHtcbiAgZW52OiBFWydCaW5kaW5ncyddXG4gIGV4ZWN1dGlvbkN0eD86IEZldGNoRXZlbnQgfCBFeGVjdXRpb25Db250ZXh0IHwgdW5kZWZpbmVkXG4gIG5vdEZvdW5kSGFuZGxlcj86IE5vdEZvdW5kSGFuZGxlcjxFPlxuICBwYXRoPzogc3RyaW5nXG4gIHBhcmFtRGF0YT86IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbn1cblxuZXhwb3J0IGNsYXNzIENvbnRleHQ8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIEUgZXh0ZW5kcyBFbnYgPSBhbnksXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIFAgZXh0ZW5kcyBzdHJpbmcgPSBhbnksXG4gIEkgZXh0ZW5kcyBJbnB1dCA9IHt9XG4+IHtcbiAgZW52OiBFWydCaW5kaW5ncyddID0ge31cbiAgZmluYWxpemVkOiBib29sZWFuID0gZmFsc2VcbiAgZXJyb3I6IEVycm9yIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgcHJpdmF0ZSBfcmVxPzogSG9ub1JlcXVlc3Q8YW55LCBhbnk+XG4gIHByaXZhdGUgX3N0YXR1czogU3RhdHVzQ29kZSA9IDIwMFxuICBwcml2YXRlIF9leGVjdXRpb25DdHg6IEZldGNoRXZlbnQgfCBFeGVjdXRpb25Db250ZXh0IHwgdW5kZWZpbmVkXG4gIHByaXZhdGUgX3ByZXR0eTogYm9vbGVhbiA9IGZhbHNlXG4gIHByaXZhdGUgX3ByZXR0eVNwYWNlOiBudW1iZXIgPSAyXG4gIHByaXZhdGUgX21hcDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gfCB1bmRlZmluZWRcbiAgcHJpdmF0ZSBfaGVhZGVyczogSGVhZGVycyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZFxuICBwcml2YXRlIF9wcmVwYXJlZEhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcbiAgcHJpdmF0ZSBfcmVzOiBSZXNwb25zZSB8IHVuZGVmaW5lZFxuICBwcml2YXRlIF9wYXRoOiBzdHJpbmcgPSAnLydcbiAgcHJpdmF0ZSBfcGFyYW1EYXRhPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB8IG51bGxcbiAgcHJpdmF0ZSByYXdSZXF1ZXN0PzogUmVxdWVzdCB8IG51bGxcbiAgcHJpdmF0ZSBub3RGb3VuZEhhbmRsZXI6IE5vdEZvdW5kSGFuZGxlcjxFPiA9ICgpID0+IG5ldyBSZXNwb25zZSgpXG5cbiAgY29uc3RydWN0b3IocmVxOiBSZXF1ZXN0LCBvcHRpb25zPzogQ29udGV4dE9wdGlvbnM8RT4pIHtcbiAgICB0aGlzLnJhd1JlcXVlc3QgPSByZXFcbiAgICBpZiAob3B0aW9ucykge1xuICAgICAgdGhpcy5fZXhlY3V0aW9uQ3R4ID0gb3B0aW9ucy5leGVjdXRpb25DdHhcbiAgICAgIHRoaXMuX3BhdGggPSBvcHRpb25zLnBhdGggPz8gJy8nXG4gICAgICB0aGlzLl9wYXJhbURhdGEgPSBvcHRpb25zLnBhcmFtRGF0YVxuICAgICAgdGhpcy5lbnYgPSBvcHRpb25zLmVudlxuICAgICAgaWYgKG9wdGlvbnMubm90Rm91bmRIYW5kbGVyKSB7XG4gICAgICAgIHRoaXMubm90Rm91bmRIYW5kbGVyID0gb3B0aW9ucy5ub3RGb3VuZEhhbmRsZXJcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXQgcmVxKCk6IEhvbm9SZXF1ZXN0PFAsIElbJ291dCddPiB7XG4gICAgaWYgKHRoaXMuX3JlcSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JlcVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgdGhpcy5fcmVxID0gbmV3IEhvbm9SZXF1ZXN0KHRoaXMucmF3UmVxdWVzdCEsIHRoaXMuX3BhdGgsIHRoaXMuX3BhcmFtRGF0YSEpXG4gICAgICB0aGlzLnJhd1JlcXVlc3QgPSB1bmRlZmluZWRcbiAgICAgIHRoaXMuX3BhcmFtRGF0YSA9IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIHRoaXMuX3JlcVxuICAgIH1cbiAgfVxuXG4gIGdldCBldmVudCgpOiBGZXRjaEV2ZW50IHtcbiAgICBpZiAodGhpcy5fZXhlY3V0aW9uQ3R4IGluc3RhbmNlb2YgRmV0Y2hFdmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4ZWN1dGlvbkN0eFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBjb250ZXh0IGhhcyBubyBGZXRjaEV2ZW50JylcbiAgICB9XG4gIH1cblxuICBnZXQgZXhlY3V0aW9uQ3R4KCk6IEV4ZWN1dGlvbkNvbnRleHQge1xuICAgIGlmICh0aGlzLl9leGVjdXRpb25DdHgpIHtcbiAgICAgIHJldHVybiB0aGlzLl9leGVjdXRpb25DdHggYXMgRXhlY3V0aW9uQ29udGV4dFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhpcyBjb250ZXh0IGhhcyBubyBFeGVjdXRpb25Db250ZXh0JylcbiAgICB9XG4gIH1cblxuICBnZXQgcmVzKCk6IFJlc3BvbnNlIHtcbiAgICByZXR1cm4gKHRoaXMuX3JlcyB8fD0gbmV3IFJlc3BvbnNlKCc0MDQgTm90IEZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KSlcbiAgfVxuXG4gIHNldCByZXMoX3JlczogUmVzcG9uc2UgfCB1bmRlZmluZWQpIHtcbiAgICBpZiAodGhpcy5fcmVzICYmIF9yZXMpIHtcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmRlbGV0ZSgnY29udGVudC10eXBlJylcbiAgICAgIHRoaXMuX3Jlcy5oZWFkZXJzLmZvckVhY2goKHYsIGspID0+IHtcbiAgICAgICAgX3Jlcy5oZWFkZXJzLnNldChrLCB2KVxuICAgICAgfSlcbiAgICB9XG4gICAgdGhpcy5fcmVzID0gX3Jlc1xuICAgIHRoaXMuZmluYWxpemVkID0gdHJ1ZVxuICB9XG5cbiAgaGVhZGVyID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0aW9ucz86IHsgYXBwZW5kPzogYm9vbGVhbiB9KTogdm9pZCA9PiB7XG4gICAgaWYgKG9wdGlvbnM/LmFwcGVuZCkge1xuICAgICAgaWYgKCF0aGlzLl9oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuX2hlYWRlcnMgPSBuZXcgSGVhZGVycyh0aGlzLl9wcmVwYXJlZEhlYWRlcnMpXG4gICAgICAgIHRoaXMuX3ByZXBhcmVkSGVhZGVycyA9IHt9XG4gICAgICB9XG4gICAgICB0aGlzLl9oZWFkZXJzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX2hlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5faGVhZGVycy5zZXQobmFtZSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9wcmVwYXJlZEhlYWRlcnMgPz89IHt9XG4gICAgICAgIHRoaXMuX3ByZXBhcmVkSGVhZGVyc1tuYW1lLnRvTG93ZXJDYXNlKCldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5maW5hbGl6ZWQpIHtcbiAgICAgIGlmIChvcHRpb25zPy5hcHBlbmQpIHtcbiAgICAgICAgdGhpcy5yZXMuaGVhZGVycy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlcy5oZWFkZXJzLnNldChuYW1lLCB2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdGF0dXMgPSAoc3RhdHVzOiBTdGF0dXNDb2RlKTogdm9pZCA9PiB7XG4gICAgdGhpcy5fc3RhdHVzID0gc3RhdHVzXG4gIH1cblxuICBzZXQgPSA8S2V5IGV4dGVuZHMga2V5b2YgRVsnVmFyaWFibGVzJ10gfCBrZXlvZiBDb250ZXh0VmFyaWFibGVNYXA+KFxuICAgIGtleTogS2V5LFxuICAgIHZhbHVlOiBHZXRWYXJpYWJsZTxLZXksIEU+XG4gICk6IHZvaWQgPT4ge1xuICAgIHRoaXMuX21hcCB8fD0ge31cbiAgICB0aGlzLl9tYXBba2V5IGFzIHN0cmluZ10gPSB2YWx1ZVxuICB9XG5cbiAgZ2V0ID0gPEtleSBleHRlbmRzIGtleW9mIEVbJ1ZhcmlhYmxlcyddIHwga2V5b2YgQ29udGV4dFZhcmlhYmxlTWFwPihcbiAgICBrZXk6IEtleVxuICApOiBHZXRWYXJpYWJsZTxLZXksIEU+ID0+IHtcbiAgICByZXR1cm4gdGhpcy5fbWFwPy5ba2V5IGFzIHN0cmluZ10gYXMgR2V0VmFyaWFibGU8S2V5LCBFPlxuICB9XG5cbiAgcHJldHR5ID0gKHByZXR0eUpTT046IGJvb2xlYW4sIHNwYWNlOiBudW1iZXIgPSAyKTogdm9pZCA9PiB7XG4gICAgdGhpcy5fcHJldHR5ID0gcHJldHR5SlNPTlxuICAgIHRoaXMuX3ByZXR0eVNwYWNlID0gc3BhY2VcbiAgfVxuXG4gIG5ld1Jlc3BvbnNlOiBOZXdSZXNwb25zZSA9IChcbiAgICBkYXRhOiBEYXRhIHwgbnVsbCxcbiAgICBhcmc/OiBTdGF0dXNDb2RlIHwgUmVzcG9uc2VJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIC8vIE9wdGltaXplZFxuICAgIGlmICghaGVhZGVycyAmJiAhdGhpcy5faGVhZGVycyAmJiAhdGhpcy5fcmVzICYmICFhcmcgJiYgdGhpcy5fc3RhdHVzID09PSAyMDApIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoZGF0YSwge1xuICAgICAgICBoZWFkZXJzOiB0aGlzLl9wcmVwYXJlZEhlYWRlcnMsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIFJldHVybiBSZXNwb25zZSBpbW1lZGlhdGVseSBpZiBhcmcgaXMgUmVxdWVzdEluaXQuXG4gICAgaWYgKGFyZyAmJiB0eXBlb2YgYXJnICE9PSAnbnVtYmVyJykge1xuICAgICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKGRhdGEsIGFyZylcbiAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gdGhpcy5fcHJlcGFyZWRIZWFkZXJzPy5bJ2NvbnRlbnQtdHlwZSddXG4gICAgICBpZiAoY29udGVudFR5cGUpIHtcbiAgICAgICAgcmVzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCBjb250ZW50VHlwZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0dXMgPSBhcmcgPz8gdGhpcy5fc3RhdHVzXG4gICAgdGhpcy5fcHJlcGFyZWRIZWFkZXJzID8/PSB7fVxuXG4gICAgdGhpcy5faGVhZGVycyA/Pz0gbmV3IEhlYWRlcnMoKVxuICAgIGZvciAoY29uc3QgW2ssIHZdIG9mIE9iamVjdC5lbnRyaWVzKHRoaXMuX3ByZXBhcmVkSGVhZGVycykpIHtcbiAgICAgIHRoaXMuX2hlYWRlcnMuc2V0KGssIHYpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3Jlcykge1xuICAgICAgdGhpcy5fcmVzLmhlYWRlcnMuZm9yRWFjaCgodiwgaykgPT4ge1xuICAgICAgICB0aGlzLl9oZWFkZXJzPy5zZXQoaywgdilcbiAgICAgIH0pXG4gICAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyh0aGlzLl9wcmVwYXJlZEhlYWRlcnMpKSB7XG4gICAgICAgIHRoaXMuX2hlYWRlcnMuc2V0KGssIHYpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaGVhZGVycyA/Pz0ge31cbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhoZWFkZXJzKSkge1xuICAgICAgaWYgKHR5cGVvZiB2ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9oZWFkZXJzLnNldChrLCB2KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faGVhZGVycy5kZWxldGUoaylcbiAgICAgICAgZm9yIChjb25zdCB2MiBvZiB2KSB7XG4gICAgICAgICAgdGhpcy5faGVhZGVycy5hcHBlbmQoaywgdjIpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKGRhdGEsIHtcbiAgICAgIHN0YXR1cyxcbiAgICAgIGhlYWRlcnM6IHRoaXMuX2hlYWRlcnMsXG4gICAgfSlcbiAgfVxuXG4gIGJvZHk6IEJvZHlSZXNwb25kID0gKFxuICAgIGRhdGE6IERhdGEgfCBudWxsLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShkYXRhLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoZGF0YSwgYXJnKVxuICB9XG5cbiAgdGV4dDogVGV4dFJlc3BvbmQgPSAoXG4gICAgdGV4dDogc3RyaW5nLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFJlc3BvbnNlID0+IHtcbiAgICAvLyBJZiB0aGUgaGVhZGVyIGlzIGVtcHR5LCByZXR1cm4gUmVzcG9uc2UgaW1tZWRpYXRlbHkuXG4gICAgLy8gQ29udGVudC1UeXBlIHdpbGwgYmUgYWRkZWQgYXV0b21hdGljYWxseSBhcyBgdGV4dC9wbGFpbmAuXG4gICAgaWYgKCF0aGlzLl9wcmVwYXJlZEhlYWRlcnMpIHtcbiAgICAgIGlmICghaGVhZGVycyAmJiAhdGhpcy5fcmVzICYmICF0aGlzLl9oZWFkZXJzICYmICFhcmcpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0ZXh0KVxuICAgICAgfVxuICAgICAgdGhpcy5fcHJlcGFyZWRIZWFkZXJzID0ge31cbiAgICB9XG4gICAgLy8gSWYgQ29udGVudC1UeXBlIGlzIG5vdCBzZXQsIHdlIGRvbid0IGhhdmUgdG8gc2V0IGB0ZXh0L3BsYWluYC5cbiAgICAvLyBGZXdlciB0aGUgaGVhZGVyIHZhbHVlcywgaXQgd2lsbCBiZSBmYXN0ZXIuXG4gICAgaWYgKHRoaXMuX3ByZXBhcmVkSGVhZGVyc1snY29udGVudC10eXBlJ10pIHtcbiAgICAgIHRoaXMuX3ByZXBhcmVkSGVhZGVyc1snY29udGVudC10eXBlJ10gPSAndGV4dC9wbGFpbjsgY2hhcnNldD1VVEY4J1xuICAgIH1cbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZSh0ZXh0LCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UodGV4dCwgYXJnKVxuICB9XG5cbiAganNvbjogSlNPTlJlc3BvbmQgPSA8VCA9IHt9PihcbiAgICBvYmplY3Q6IFQsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlcXVlc3RJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKSA9PiB7XG4gICAgY29uc3QgYm9keSA9IHRoaXMuX3ByZXR0eVxuICAgICAgPyBKU09OLnN0cmluZ2lmeShvYmplY3QsIG51bGwsIHRoaXMuX3ByZXR0eVNwYWNlKVxuICAgICAgOiBKU09OLnN0cmluZ2lmeShvYmplY3QpXG4gICAgdGhpcy5fcHJlcGFyZWRIZWFkZXJzID8/PSB7fVxuICAgIHRoaXMuX3ByZXBhcmVkSGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShib2R5LCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoYm9keSwgYXJnKVxuICB9XG5cbiAganNvblQ6IEpTT05UUmVzcG9uZCA9IDxUPihcbiAgICBvYmplY3Q6IFQgZXh0ZW5kcyBKU09OVmFsdWUgPyBUIDogSlNPTlZhbHVlLFxuICAgIGFyZz86IFN0YXR1c0NvZGUgfCBSZXF1ZXN0SW5pdCxcbiAgICBoZWFkZXJzPzogSGVhZGVyUmVjb3JkXG4gICk6IFR5cGVkUmVzcG9uc2U8VCBleHRlbmRzIEpTT05WYWx1ZSA/IChKU09OVmFsdWUgZXh0ZW5kcyBUID8gbmV2ZXIgOiBUKSA6IG5ldmVyPiA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3BvbnNlOiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyA/IHRoaXMuanNvbihvYmplY3QsIGFyZywgaGVhZGVycykgOiB0aGlzLmpzb24ob2JqZWN0LCBhcmcpLFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgIGRhdGE6IG9iamVjdCBhcyBhbnksXG4gICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICB9XG4gIH1cblxuICBodG1sOiBIVE1MUmVzcG9uZCA9IChcbiAgICBodG1sOiBzdHJpbmcsXG4gICAgYXJnPzogU3RhdHVzQ29kZSB8IFJlcXVlc3RJbml0LFxuICAgIGhlYWRlcnM/OiBIZWFkZXJSZWNvcmRcbiAgKTogUmVzcG9uc2UgPT4ge1xuICAgIHRoaXMuX3ByZXBhcmVkSGVhZGVycyA/Pz0ge31cbiAgICB0aGlzLl9wcmVwYXJlZEhlYWRlcnNbJ2NvbnRlbnQtdHlwZSddID0gJ3RleHQvaHRtbDsgY2hhcnNldD1VVEYtOCdcbiAgICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcidcbiAgICAgID8gdGhpcy5uZXdSZXNwb25zZShodG1sLCBhcmcsIGhlYWRlcnMpXG4gICAgICA6IHRoaXMubmV3UmVzcG9uc2UoaHRtbCwgYXJnKVxuICB9XG5cbiAgcmVkaXJlY3QgPSAobG9jYXRpb246IHN0cmluZywgc3RhdHVzOiBTdGF0dXNDb2RlID0gMzAyKTogUmVzcG9uc2UgPT4ge1xuICAgIHRoaXMuX2hlYWRlcnMgPz89IG5ldyBIZWFkZXJzKClcbiAgICB0aGlzLl9oZWFkZXJzLnNldCgnTG9jYXRpb24nLCBsb2NhdGlvbilcbiAgICByZXR1cm4gdGhpcy5uZXdSZXNwb25zZShudWxsLCBzdGF0dXMpXG4gIH1cblxuICBjb29raWUgPSAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBvcHQ/OiBDb29raWVPcHRpb25zKTogdm9pZCA9PiB7XG4gICAgY29uc3QgY29va2llID0gc2VyaWFsaXplKG5hbWUsIHZhbHVlLCBvcHQpXG4gICAgdGhpcy5oZWFkZXIoJ3NldC1jb29raWUnLCBjb29raWUsIHsgYXBwZW5kOiB0cnVlIH0pXG4gIH1cblxuICBub3RGb3VuZCA9ICgpOiBSZXNwb25zZSB8IFByb21pc2U8UmVzcG9uc2U+ID0+IHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiB0aGlzLm5vdEZvdW5kSGFuZGxlcih0aGlzKVxuICB9XG5cbiAgZ2V0IHJ1bnRpbWUoKTogUnVudGltZSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICBjb25zdCBnbG9iYWwgPSBnbG9iYWxUaGlzIGFzIGFueVxuXG4gICAgaWYgKGdsb2JhbD8uRGVubyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gJ2Rlbm8nXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uQnVuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnYnVuJ1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZ2xvYmFsPy5XZWJTb2NrZXRQYWlyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gJ3dvcmtlcmQnXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBnbG9iYWw/LkVkZ2VSdW50aW1lID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuICdlZGdlLWxpZ2h0J1xuICAgIH1cblxuICAgIGxldCBvbkZhc3RseSA9IGZhbHNlXG4gICAgdHJ5IHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIGNvbnN0IHsgZW52IH0gPSByZXF1aXJlKCdmYXN0bHk6ZW52JylcbiAgICAgIGlmIChlbnYgaW5zdGFuY2VvZiBGdW5jdGlvbikgb25GYXN0bHkgPSB0cnVlXG4gICAgfSBjYXRjaCB7fVxuICAgIGlmIChvbkZhc3RseSkge1xuICAgICAgcmV0dXJuICdmYXN0bHknXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8uX19sYWdvbl9fICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnbGFnb24nXG4gICAgfVxuXG4gICAgaWYgKGdsb2JhbD8ucHJvY2Vzcz8ucmVsZWFzZT8ubmFtZSA9PT0gJ25vZGUnKSB7XG4gICAgICByZXR1cm4gJ25vZGUnXG4gICAgfVxuXG4gICAgcmV0dXJuICdvdGhlcidcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsV0FBVyxRQUFRLGVBQWM7QUFJMUMsU0FBUyxTQUFTLFFBQVEsb0JBQW1CO0FBNkQ3QyxPQUFPLE1BQU07SUFPWCxNQUFxQixDQUFDLEVBQUM7SUFDdkIs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