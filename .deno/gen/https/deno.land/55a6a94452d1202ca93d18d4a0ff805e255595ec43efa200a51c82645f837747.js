import { METHOD_NAME_ALL } from '../../router.ts';
import { splitPath, splitRoutingPath, getPattern } from '../../utils/url.ts';
function findParam(node, name) {
    for(let i = 0, len = node.patterns.length; i < len; i++){
        if (typeof node.patterns[i] === 'object' && node.patterns[i][1] === name) {
            return true;
        }
    }
    const nodes = Object.values(node.children);
    for(let i1 = 0, len1 = nodes.length; i1 < len1; i1++){
        if (findParam(nodes[i1], name)) {
            return true;
        }
    }
    return false;
}
export class Node {
    methods;
    children;
    patterns;
    order = 0;
    name;
    handlerSetCache;
    shouldCapture = false;
    constructor(method, handler, children){
        this.children = children || {};
        this.methods = [];
        this.name = '';
        if (method && handler) {
            const m = {};
            m[method] = {
                handler: handler,
                score: 0,
                name: this.name
            };
            this.methods = [
                m
            ];
        }
        this.patterns = [];
        this.handlerSetCache = {};
    }
    insert(method, path, handler) {
        this.name = `${method} ${path}`;
        this.order = ++this.order;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curNode = this;
        const parts = splitRoutingPath(path);
        const parentPatterns = [];
        const errorMessage = (name)=>{
            return `Duplicate param name, use another name instead of '${name}' - ${method} ${path} <--- '${name}'`;
        };
        for(let i = 0, len = parts.length; i < len; i++){
            const p = parts[i];
            if (Object.keys(curNode.children).includes(p)) {
                parentPatterns.push(...curNode.patterns);
                curNode = curNode.children[p];
                continue;
            }
            curNode.children[p] = new Node();
            const pattern = getPattern(p);
            if (pattern) {
                if (typeof pattern === 'object') {
                    this.shouldCapture = true;
                    for(let j = 0, len1 = parentPatterns.length; j < len1; j++){
                        if (typeof parentPatterns[j] === 'object' && parentPatterns[j][1] === pattern[1]) {
                            throw new Error(errorMessage(pattern[1]));
                        }
                    }
                    if (Object.values(curNode.children).some((n)=>findParam(n, pattern[1]))) {
                        throw new Error(errorMessage(pattern[1]));
                    }
                }
                curNode.patterns.push(pattern);
                parentPatterns.push(...curNode.patterns);
            }
            parentPatterns.push(...curNode.patterns);
            curNode = curNode.children[p];
            curNode.shouldCapture = this.shouldCapture;
        }
        if (!curNode.methods.length) {
            curNode.methods = [];
        }
        const m = {};
        const handlerSet = {
            handler: handler,
            name: this.name,
            score: this.order
        };
        m[method] = handlerSet;
        curNode.methods.push(m);
        return curNode;
    }
    getHandlerSets(node, method, wildcard) {
        return node.handlerSetCache[`${method}:${wildcard ? '1' : '0'}`] ||= (()=>{
            const handlerSets = [];
            for(let i = 0, len = node.methods.length; i < len; i++){
                const m = node.methods[i];
                const handlerSet = m[method] || m[METHOD_NAME_ALL];
                if (handlerSet !== undefined) {
                    handlerSets.push(handlerSet);
                }
            }
            return handlerSets;
        })();
    }
    search(method, path) {
        const handlerSets = [];
        const params = {};
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const curNode = this;
        let curNodes = [
            curNode
        ];
        const parts = splitPath(path);
        for(let i = 0, len = parts.length; i < len; i++){
            const part = parts[i];
            const isLast = i === len - 1;
            const tempNodes = [];
            let matched = false;
            for(let j = 0, len2 = curNodes.length; j < len2; j++){
                const node = curNodes[j];
                const nextNode = node.children[part];
                if (nextNode) {
                    if (isLast === true) {
                        // '/hello/*' => match '/hello'
                        if (nextNode.children['*']) {
                            handlerSets.push(...this.getHandlerSets(nextNode.children['*'], method, true));
                        }
                        handlerSets.push(...this.getHandlerSets(nextNode, method));
                        matched = true;
                    } else {
                        tempNodes.push(nextNode);
                    }
                }
                for(let k = 0, len3 = node.patterns.length; k < len3; k++){
                    const pattern = node.patterns[k];
                    // Wildcard
                    // '/hello/*/foo' => match /hello/bar/foo
                    if (pattern === '*') {
                        const astNode = node.children['*'];
                        if (astNode) {
                            handlerSets.push(...this.getHandlerSets(astNode, method));
                            tempNodes.push(astNode);
                        }
                        continue;
                    }
                    if (part === '') continue;
                    // Named match
                    // `/posts/:id` => match /posts/123
                    const [key, name, matcher] = pattern;
                    // `/js/:filename{[a-z]+.js}` => match /js/chunk/123.js
                    const restPathString = parts.slice(i).join('/');
                    if (matcher instanceof RegExp && matcher.test(restPathString)) {
                        handlerSets.push(...this.getHandlerSets(node.children[key], method));
                        params[name] = restPathString;
                        continue;
                    }
                    if (matcher === true || matcher instanceof RegExp && matcher.test(part)) {
                        if (typeof key === 'string') {
                            if (isLast === true) {
                                handlerSets.push(...this.getHandlerSets(node.children[key], method));
                            } else {
                                tempNodes.push(node.children[key]);
                            }
                        }
                        // `/book/a`     => no-slug
                        // `/book/:slug` => slug
                        // `/book/b`     => no-slug-b
                        // GET /book/a   ~> no-slug, param['slug'] => undefined
                        // GET /book/foo ~> slug, param['slug'] => foo
                        // GET /book/b   ~> no-slug-b, param['slug'] => b
                        if (typeof name === 'string' && !matched) {
                            params[name] = part;
                        } else {
                            if (node.children[part] && node.children[part].shouldCapture) {
                                params[name] = part;
                            }
                        }
                    }
                }
            }
            curNodes = tempNodes;
        }
        const len1 = handlerSets.length;
        if (len1 === 0) return null;
        if (len1 === 1) return {
            handlers: [
                handlerSets[0].handler
            ],
            params
        };
        const handlers = handlerSets.sort((a, b)=>{
            return a.score - b.score;
        }).map((s)=>{
            return s.handler;
        });
        return {
            handlers,
            params
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvcm91dGVyL3RyaWUtcm91dGVyL25vZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBSZXN1bHQgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgdHlwZSB7IFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5pbXBvcnQgeyBzcGxpdFBhdGgsIHNwbGl0Um91dGluZ1BhdGgsIGdldFBhdHRlcm4gfSBmcm9tICcuLi8uLi91dGlscy91cmwudHMnXG5cbnR5cGUgSGFuZGxlclNldDxUPiA9IHtcbiAgaGFuZGxlcjogVFxuICBzY29yZTogbnVtYmVyXG4gIG5hbWU6IHN0cmluZyAvLyBGb3IgZGVidWdcbn1cblxuZnVuY3Rpb24gZmluZFBhcmFtPFQ+KG5vZGU6IE5vZGU8VD4sIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMCwgbGVuID0gbm9kZS5wYXR0ZXJucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmICh0eXBlb2Ygbm9kZS5wYXR0ZXJuc1tpXSA9PT0gJ29iamVjdCcgJiYgbm9kZS5wYXR0ZXJuc1tpXVsxXSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgY29uc3Qgbm9kZXMgPSBPYmplY3QudmFsdWVzKG5vZGUuY2hpbGRyZW4pXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChmaW5kUGFyYW0obm9kZXNbaV0sIG5hbWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmYWxzZVxufVxuXG5leHBvcnQgY2xhc3MgTm9kZTxUPiB7XG4gIG1ldGhvZHM6IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJTZXQ8VD4+W11cblxuICBjaGlsZHJlbjogUmVjb3JkPHN0cmluZywgTm9kZTxUPj5cbiAgcGF0dGVybnM6IFBhdHRlcm5bXVxuICBvcmRlcjogbnVtYmVyID0gMFxuICBuYW1lOiBzdHJpbmdcbiAgaGFuZGxlclNldENhY2hlOiBSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyU2V0PFQ+W10+XG4gIHNob3VsZENhcHR1cmU6IGJvb2xlYW4gPSBmYWxzZVxuXG4gIGNvbnN0cnVjdG9yKG1ldGhvZD86IHN0cmluZywgaGFuZGxlcj86IFQsIGNoaWxkcmVuPzogUmVjb3JkPHN0cmluZywgTm9kZTxUPj4pIHtcbiAgICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW4gfHwge31cbiAgICB0aGlzLm1ldGhvZHMgPSBbXVxuICAgIHRoaXMubmFtZSA9ICcnXG4gICAgaWYgKG1ldGhvZCAmJiBoYW5kbGVyKSB7XG4gICAgICBjb25zdCBtOiBSZWNvcmQ8c3RyaW5nLCBIYW5kbGVyU2V0PFQ+PiA9IHt9XG4gICAgICBtW21ldGhvZF0gPSB7IGhhbmRsZXI6IGhhbmRsZXIsIHNjb3JlOiAwLCBuYW1lOiB0aGlzLm5hbWUgfVxuICAgICAgdGhpcy5tZXRob2RzID0gW21dXG4gICAgfVxuICAgIHRoaXMucGF0dGVybnMgPSBbXVxuICAgIHRoaXMuaGFuZGxlclNldENhY2hlID0ge31cbiAgfVxuXG4gIGluc2VydChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBoYW5kbGVyOiBUKTogTm9kZTxUPiB7XG4gICAgdGhpcy5uYW1lID0gYCR7bWV0aG9kfSAke3BhdGh9YFxuICAgIHRoaXMub3JkZXIgPSArK3RoaXMub3JkZXJcblxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuICAgIGxldCBjdXJOb2RlOiBOb2RlPFQ+ID0gdGhpc1xuICAgIGNvbnN0IHBhcnRzID0gc3BsaXRSb3V0aW5nUGF0aChwYXRoKVxuXG4gICAgY29uc3QgcGFyZW50UGF0dGVybnM6IFBhdHRlcm5bXSA9IFtdXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gKG5hbWU6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgICByZXR1cm4gYER1cGxpY2F0ZSBwYXJhbSBuYW1lLCB1c2UgYW5vdGhlciBuYW1lIGluc3RlYWQgb2YgJyR7bmFtZX0nIC0gJHttZXRob2R9ICR7cGF0aH0gPC0tLSAnJHtuYW1lfSdgXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHBhcnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCBwOiBzdHJpbmcgPSBwYXJ0c1tpXVxuXG4gICAgICBpZiAoT2JqZWN0LmtleXMoY3VyTm9kZS5jaGlsZHJlbikuaW5jbHVkZXMocCkpIHtcbiAgICAgICAgcGFyZW50UGF0dGVybnMucHVzaCguLi5jdXJOb2RlLnBhdHRlcm5zKVxuICAgICAgICBjdXJOb2RlID0gY3VyTm9kZS5jaGlsZHJlbltwXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBjdXJOb2RlLmNoaWxkcmVuW3BdID0gbmV3IE5vZGUoKVxuXG4gICAgICBjb25zdCBwYXR0ZXJuID0gZ2V0UGF0dGVybihwKVxuICAgICAgaWYgKHBhdHRlcm4pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYXR0ZXJuID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRoaXMuc2hvdWxkQ2FwdHVyZSA9IHRydWVcbiAgICAgICAgICBmb3IgKGxldCBqID0gMCwgbGVuID0gcGFyZW50UGF0dGVybnMubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFyZW50UGF0dGVybnNbal0gPT09ICdvYmplY3QnICYmIHBhcmVudFBhdHRlcm5zW2pdWzFdID09PSBwYXR0ZXJuWzFdKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UocGF0dGVyblsxXSkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChPYmplY3QudmFsdWVzKGN1ck5vZGUuY2hpbGRyZW4pLnNvbWUoKG4pID0+IGZpbmRQYXJhbShuLCBwYXR0ZXJuWzFdKSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UocGF0dGVyblsxXSkpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN1ck5vZGUucGF0dGVybnMucHVzaChwYXR0ZXJuKVxuICAgICAgICBwYXJlbnRQYXR0ZXJucy5wdXNoKC4uLmN1ck5vZGUucGF0dGVybnMpXG4gICAgICB9XG4gICAgICBwYXJlbnRQYXR0ZXJucy5wdXNoKC4uLmN1ck5vZGUucGF0dGVybnMpXG4gICAgICBjdXJOb2RlID0gY3VyTm9kZS5jaGlsZHJlbltwXVxuICAgICAgY3VyTm9kZS5zaG91bGRDYXB0dXJlID0gdGhpcy5zaG91bGRDYXB0dXJlXG4gICAgfVxuXG4gICAgaWYgKCFjdXJOb2RlLm1ldGhvZHMubGVuZ3RoKSB7XG4gICAgICBjdXJOb2RlLm1ldGhvZHMgPSBbXVxuICAgIH1cblxuICAgIGNvbnN0IG06IFJlY29yZDxzdHJpbmcsIEhhbmRsZXJTZXQ8VD4+ID0ge31cblxuICAgIGNvbnN0IGhhbmRsZXJTZXQ6IEhhbmRsZXJTZXQ8VD4gPSB7IGhhbmRsZXI6IGhhbmRsZXIsIG5hbWU6IHRoaXMubmFtZSwgc2NvcmU6IHRoaXMub3JkZXIgfVxuXG4gICAgbVttZXRob2RdID0gaGFuZGxlclNldFxuICAgIGN1ck5vZGUubWV0aG9kcy5wdXNoKG0pXG5cbiAgICByZXR1cm4gY3VyTm9kZVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRIYW5kbGVyU2V0cyhub2RlOiBOb2RlPFQ+LCBtZXRob2Q6IHN0cmluZywgd2lsZGNhcmQ/OiBib29sZWFuKTogSGFuZGxlclNldDxUPltdIHtcbiAgICByZXR1cm4gKG5vZGUuaGFuZGxlclNldENhY2hlW2Ake21ldGhvZH06JHt3aWxkY2FyZCA/ICcxJyA6ICcwJ31gXSB8fD0gKCgpID0+IHtcbiAgICAgIGNvbnN0IGhhbmRsZXJTZXRzOiBIYW5kbGVyU2V0PFQ+W10gPSBbXVxuICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IG5vZGUubWV0aG9kcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjb25zdCBtID0gbm9kZS5tZXRob2RzW2ldXG4gICAgICAgIGNvbnN0IGhhbmRsZXJTZXQgPSBtW21ldGhvZF0gfHwgbVtNRVRIT0RfTkFNRV9BTExdXG4gICAgICAgIGlmIChoYW5kbGVyU2V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKGhhbmRsZXJTZXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBoYW5kbGVyU2V0c1xuICAgIH0pKCkpXG4gIH1cblxuICBzZWFyY2gobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyk6IFJlc3VsdDxUPiB8IG51bGwge1xuICAgIGNvbnN0IGhhbmRsZXJTZXRzOiBIYW5kbGVyU2V0PFQ+W10gPSBbXVxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcbiAgICBjb25zdCBjdXJOb2RlOiBOb2RlPFQ+ID0gdGhpc1xuICAgIGxldCBjdXJOb2RlcyA9IFtjdXJOb2RlXVxuICAgIGNvbnN0IHBhcnRzID0gc3BsaXRQYXRoKHBhdGgpXG5cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFydHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhcnQ6IHN0cmluZyA9IHBhcnRzW2ldXG4gICAgICBjb25zdCBpc0xhc3QgPSBpID09PSBsZW4gLSAxXG4gICAgICBjb25zdCB0ZW1wTm9kZXM6IE5vZGU8VD5bXSA9IFtdXG4gICAgICBsZXQgbWF0Y2hlZCA9IGZhbHNlXG5cbiAgICAgIGZvciAobGV0IGogPSAwLCBsZW4yID0gY3VyTm9kZXMubGVuZ3RoOyBqIDwgbGVuMjsgaisrKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBjdXJOb2Rlc1tqXVxuICAgICAgICBjb25zdCBuZXh0Tm9kZSA9IG5vZGUuY2hpbGRyZW5bcGFydF1cblxuICAgICAgICBpZiAobmV4dE5vZGUpIHtcbiAgICAgICAgICBpZiAoaXNMYXN0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyAnL2hlbGxvLyonID0+IG1hdGNoICcvaGVsbG8nXG4gICAgICAgICAgICBpZiAobmV4dE5vZGUuY2hpbGRyZW5bJyonXSkge1xuICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ2V0SGFuZGxlclNldHMobmV4dE5vZGUuY2hpbGRyZW5bJyonXSwgbWV0aG9kLCB0cnVlKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZXJTZXRzLnB1c2goLi4udGhpcy5nZXRIYW5kbGVyU2V0cyhuZXh0Tm9kZSwgbWV0aG9kKSlcbiAgICAgICAgICAgIG1hdGNoZWQgPSB0cnVlXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBOb2Rlcy5wdXNoKG5leHROb2RlKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGsgPSAwLCBsZW4zID0gbm9kZS5wYXR0ZXJucy5sZW5ndGg7IGsgPCBsZW4zOyBrKyspIHtcbiAgICAgICAgICBjb25zdCBwYXR0ZXJuID0gbm9kZS5wYXR0ZXJuc1trXVxuXG4gICAgICAgICAgLy8gV2lsZGNhcmRcbiAgICAgICAgICAvLyAnL2hlbGxvLyovZm9vJyA9PiBtYXRjaCAvaGVsbG8vYmFyL2Zvb1xuICAgICAgICAgIGlmIChwYXR0ZXJuID09PSAnKicpIHtcbiAgICAgICAgICAgIGNvbnN0IGFzdE5vZGUgPSBub2RlLmNoaWxkcmVuWycqJ11cbiAgICAgICAgICAgIGlmIChhc3ROb2RlKSB7XG4gICAgICAgICAgICAgIGhhbmRsZXJTZXRzLnB1c2goLi4udGhpcy5nZXRIYW5kbGVyU2V0cyhhc3ROb2RlLCBtZXRob2QpKVxuICAgICAgICAgICAgICB0ZW1wTm9kZXMucHVzaChhc3ROb2RlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAocGFydCA9PT0gJycpIGNvbnRpbnVlXG5cbiAgICAgICAgICAvLyBOYW1lZCBtYXRjaFxuICAgICAgICAgIC8vIGAvcG9zdHMvOmlkYCA9PiBtYXRjaCAvcG9zdHMvMTIzXG4gICAgICAgICAgY29uc3QgW2tleSwgbmFtZSwgbWF0Y2hlcl0gPSBwYXR0ZXJuXG5cbiAgICAgICAgICAvLyBgL2pzLzpmaWxlbmFtZXtbYS16XSsuanN9YCA9PiBtYXRjaCAvanMvY2h1bmsvMTIzLmpzXG4gICAgICAgICAgY29uc3QgcmVzdFBhdGhTdHJpbmcgPSBwYXJ0cy5zbGljZShpKS5qb2luKCcvJylcbiAgICAgICAgICBpZiAobWF0Y2hlciBpbnN0YW5jZW9mIFJlZ0V4cCAmJiBtYXRjaGVyLnRlc3QocmVzdFBhdGhTdHJpbmcpKSB7XG4gICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ2V0SGFuZGxlclNldHMobm9kZS5jaGlsZHJlbltrZXldLCBtZXRob2QpKVxuICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gcmVzdFBhdGhTdHJpbmdcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1hdGNoZXIgPT09IHRydWUgfHwgKG1hdGNoZXIgaW5zdGFuY2VvZiBSZWdFeHAgJiYgbWF0Y2hlci50ZXN0KHBhcnQpKSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgIGlmIChpc0xhc3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyU2V0cy5wdXNoKC4uLnRoaXMuZ2V0SGFuZGxlclNldHMobm9kZS5jaGlsZHJlbltrZXldLCBtZXRob2QpKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBOb2Rlcy5wdXNoKG5vZGUuY2hpbGRyZW5ba2V5XSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBgL2Jvb2svYWAgICAgID0+IG5vLXNsdWdcbiAgICAgICAgICAgIC8vIGAvYm9vay86c2x1Z2AgPT4gc2x1Z1xuICAgICAgICAgICAgLy8gYC9ib29rL2JgICAgICA9PiBuby1zbHVnLWJcbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9hICAgfj4gbm8tc2x1ZywgcGFyYW1bJ3NsdWcnXSA9PiB1bmRlZmluZWRcbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9mb28gfj4gc2x1ZywgcGFyYW1bJ3NsdWcnXSA9PiBmb29cbiAgICAgICAgICAgIC8vIEdFVCAvYm9vay9iICAgfj4gbm8tc2x1Zy1iLCBwYXJhbVsnc2x1ZyddID0+IGJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgJiYgIW1hdGNoZWQpIHtcbiAgICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gcGFydFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW5bcGFydF0gJiYgbm9kZS5jaGlsZHJlbltwYXJ0XS5zaG91bGRDYXB0dXJlKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zW25hbWVdID0gcGFydFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGN1ck5vZGVzID0gdGVtcE5vZGVzXG4gICAgfVxuXG4gICAgY29uc3QgbGVuID0gaGFuZGxlclNldHMubGVuZ3RoXG4gICAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIG51bGxcbiAgICBpZiAobGVuID09PSAxKSByZXR1cm4geyBoYW5kbGVyczogW2hhbmRsZXJTZXRzWzBdLmhhbmRsZXJdLCBwYXJhbXMgfVxuXG4gICAgY29uc3QgaGFuZGxlcnMgPSBoYW5kbGVyU2V0c1xuICAgICAgLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgcmV0dXJuIGEuc2NvcmUgLSBiLnNjb3JlXG4gICAgICB9KVxuICAgICAgLm1hcCgocykgPT4ge1xuICAgICAgICByZXR1cm4gcy5oYW5kbGVyXG4gICAgICB9KVxuXG4gICAgcmV0dXJuIHsgaGFuZGxlcnMsIHBhcmFtcyB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLGVBQWUsUUFBUSxrQkFBaUI7QUFFakQsU0FBUyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxRQUFRLHFCQUFvQjtBQVE1RSxTQUFTLFVBQWEsSUFBYSxFQUFFLElBQVksRUFBVztJQUMxRCxJQUFLLElBQUksSUFBSSxHQUFHLE1BQU0sS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1FBQ3hELElBQUksT0FBTyxLQUFLLFFBQVEsQ0FBQyxFQUFFLEtBQUssWUFBWSxLQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLE1BQU07WUFDeEUsT0FBTyxJQUFJO1FBQ2IsQ0FBQztJQUNIO0lBQ0EsTUFBTSxRQUFRLE9BQU8sTUFBTSxDQUFDLEtBQUssUUFBUTtJQUN6QyxJQUFLLElBQUksS0FBSSxHQUFHLE9BQU0sTUFBTSxNQUFNLEVBQUUsS0FBSSxNQUFLLEtBQUs7UUFDaEQsSUFBSSxVQUFVLEtBQUssQ0FBQyxHQUFFLEVBQUUsT0FBTztZQUM3QixPQUFPLElBQUk7UUFDYixDQUFDO0lBQ0g7SUFFQSxPQUFPLEtBQUs7QUFDZDtBQUVBLE9BQU8sTUFBTTtJQUNYLFFBQXdDO0lBRXhDLFNBQWlDO0lBQ2pDLFNBQW1CO0lBQ25CLFFBQWdCLEVBQUM7SUFDakIsS0FBWTtJQUNaLGdCQUFnRDtJQUNoRCxnQkFBeUIsS0FBSyxDQUFBO0lBRTlCLFlBQVksTUFBZSxFQUFFLE9BQVcsRUFBRSxRQUFrQyxDQUFFO1FBQzVFLElBQUksQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRTtRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxVQUFVLFNBQVM7WUFDckIsTUFBTSxJQUFtQyxDQUFDO1lBQzFDLENBQUMsQ0FBQyxPQUFPLEdBQUc7Z0JBQUUsU0FBUztnQkFBUyxPQUFPO2dCQUFHLE1BQU0sSUFBSSxDQUFDLElBQUk7WUFBQztZQUMxRCxJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUFDO2FBQUU7UUFDcEIsQ0FBQztRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRTtRQUNsQixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUM7SUFDMUI7SUFFQSxPQUFPLE1BQWMsRUFBRSxJQUFZLEVBQUUsT0FBVSxFQUFXO1FBQ3hELElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUs7UUFFekIsNERBQTREO1FBQzVELElBQUksVUFBbUIsSUFBSTtRQUMzQixNQUFNLFFBQVEsaUJBQWlCO1FBRS9CLE1BQU0saUJBQTRCLEVBQUU7UUFDcEMsTUFBTSxlQUFlLENBQUMsT0FBeUI7WUFDN0MsT0FBTyxDQUFDLG1EQUFtRCxFQUFFLEtBQUssSUFBSSxFQUFFLE9BQU8sQ0FBQyxFQUFFLEtBQUssT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pHO1FBRUEsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLE1BQU0sTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1lBQ2hELE1BQU0sSUFBWSxLQUFLLENBQUMsRUFBRTtZQUUxQixJQUFJLE9BQU8sSUFBSSxDQUFDLFFBQVEsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJO2dCQUM3QyxlQUFlLElBQUksSUFBSSxRQUFRLFFBQVE7Z0JBQ3ZDLFVBQVUsUUFBUSxRQUFRLENBQUMsRUFBRTtnQkFDN0IsUUFBUTtZQUNWLENBQUM7WUFFRCxRQUFRLFFBQVEsQ0FBQyxFQUFFLEdBQUcsSUFBSTtZQUUxQixNQUFNLFVBQVUsV0FBVztZQUMzQixJQUFJLFNBQVM7Z0JBQ1gsSUFBSSxPQUFPLFlBQVksVUFBVTtvQkFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJO29CQUN6QixJQUFLLElBQUksSUFBSSxHQUFHLE9BQU0sZUFBZSxNQUFNLEVBQUUsSUFBSSxNQUFLLElBQUs7d0JBQ3pELElBQUksT0FBTyxjQUFjLENBQUMsRUFBRSxLQUFLLFlBQVksY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLEVBQUUsRUFBRTs0QkFDaEYsTUFBTSxJQUFJLE1BQU0sYUFBYSxPQUFPLENBQUMsRUFBRSxHQUFFO3dCQUMzQyxDQUFDO29CQUNIO29CQUNBLElBQUksT0FBTyxNQUFNLENBQUMsUUFBUSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEVBQUUsSUFBSTt3QkFDekUsTUFBTSxJQUFJLE1BQU0sYUFBYSxPQUFPLENBQUMsRUFBRSxHQUFFO29CQUMzQyxDQUFDO2dCQUNILENBQUM7Z0JBQ0QsUUFBUSxRQUFRLENBQUMsSUFBSSxDQUFDO2dCQUN0QixlQUFlLElBQUksSUFBSSxRQUFRLFFBQVE7WUFDekMsQ0FBQztZQUNELGVBQWUsSUFBSSxJQUFJLFFBQVEsUUFBUTtZQUN2QyxVQUFVLFFBQVEsUUFBUSxDQUFDLEVBQUU7WUFDN0IsUUFBUSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWE7UUFDNUM7UUFFQSxJQUFJLENBQUMsUUFBUSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQzNCLFFBQVEsT0FBTyxHQUFHLEVBQUU7UUFDdEIsQ0FBQztRQUVELE1BQU0sSUFBbUMsQ0FBQztRQUUxQyxNQUFNLGFBQTRCO1lBQUUsU0FBUztZQUFTLE1BQU0sSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPLElBQUksQ0FBQyxLQUFLO1FBQUM7UUFFekYsQ0FBQyxDQUFDLE9BQU8sR0FBRztRQUNaLFFBQVEsT0FBTyxDQUFDLElBQUksQ0FBQztRQUVyQixPQUFPO0lBQ1Q7SUFFUSxlQUFlLElBQWEsRUFBRSxNQUFjLEVBQUUsUUFBa0IsRUFBbUI7UUFDekYsT0FBUSxLQUFLLGVBQWUsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUUsV0FBVyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQU07WUFDM0UsTUFBTSxjQUErQixFQUFFO1lBQ3ZDLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxLQUFLLElBQUs7Z0JBQ3ZELE1BQU0sSUFBSSxLQUFLLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QixNQUFNLGFBQWEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsZ0JBQWdCO2dCQUNsRCxJQUFJLGVBQWUsV0FBVztvQkFDNUIsWUFBWSxJQUFJLENBQUM7Z0JBQ25CLENBQUM7WUFDSDtZQUNBLE9BQU87UUFDVCxDQUFDO0lBQ0g7SUFFQSxPQUFPLE1BQWMsRUFBRSxJQUFZLEVBQW9CO1FBQ3JELE1BQU0sY0FBK0IsRUFBRTtRQUN2QyxNQUFNLFNBQWlDLENBQUM7UUFFeEMsNERBQTREO1FBQzVELE1BQU0sVUFBbUIsSUFBSTtRQUM3QixJQUFJLFdBQVc7WUFBQztTQUFRO1FBQ3hCLE1BQU0sUUFBUSxVQUFVO1FBRXhCLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxNQUFNLE1BQU0sRUFBRSxJQUFJLEtBQUssSUFBSztZQUNoRCxNQUFNLE9BQWUsS0FBSyxDQUFDLEVBQUU7WUFDN0IsTUFBTSxTQUFTLE1BQU0sTUFBTTtZQUMzQixNQUFNLFlBQXVCLEVBQUU7WUFDL0IsSUFBSSxVQUFVLEtBQUs7WUFFbkIsSUFBSyxJQUFJLElBQUksR0FBRyxPQUFPLFNBQVMsTUFBTSxFQUFFLElBQUksTUFBTSxJQUFLO2dCQUNyRCxNQUFNLE9BQU8sUUFBUSxDQUFDLEVBQUU7Z0JBQ3hCLE1BQU0sV0FBVyxLQUFLLFFBQVEsQ0FBQyxLQUFLO2dCQUVwQyxJQUFJLFVBQVU7b0JBQ1osSUFBSSxXQUFXLElBQUksRUFBRTt3QkFDbkIsK0JBQStCO3dCQUMvQixJQUFJLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRTs0QkFDMUIsWUFBWSxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxJQUFJO3dCQUM5RSxDQUFDO3dCQUNELFlBQVksSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVTt3QkFDbEQsVUFBVSxJQUFJO29CQUNoQixPQUFPO3dCQUNMLFVBQVUsSUFBSSxDQUFDO29CQUNqQixDQUFDO2dCQUNILENBQUM7Z0JBRUQsSUFBSyxJQUFJLElBQUksR0FBRyxPQUFPLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLE1BQU0sSUFBSztvQkFDMUQsTUFBTSxVQUFVLEtBQUssUUFBUSxDQUFDLEVBQUU7b0JBRWhDLFdBQVc7b0JBQ1gseUNBQXlDO29CQUN6QyxJQUFJLFlBQVksS0FBSzt3QkFDbkIsTUFBTSxVQUFVLEtBQUssUUFBUSxDQUFDLElBQUk7d0JBQ2xDLElBQUksU0FBUzs0QkFDWCxZQUFZLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVM7NEJBQ2pELFVBQVUsSUFBSSxDQUFDO3dCQUNqQixDQUFDO3dCQUNELFFBQVE7b0JBQ1YsQ0FBQztvQkFFRCxJQUFJLFNBQVMsSUFBSSxRQUFRO29CQUV6QixjQUFjO29CQUNkLG1DQUFtQztvQkFDbkMsTUFBTSxDQUFDLEtBQUssTUFBTSxRQUFRLEdBQUc7b0JBRTdCLHVEQUF1RDtvQkFDdkQsTUFBTSxpQkFBaUIsTUFBTSxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQzNDLElBQUksbUJBQW1CLFVBQVUsUUFBUSxJQUFJLENBQUMsaUJBQWlCO3dCQUM3RCxZQUFZLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTt3QkFDNUQsTUFBTSxDQUFDLEtBQUssR0FBRzt3QkFDZixRQUFRO29CQUNWLENBQUM7b0JBRUQsSUFBSSxZQUFZLElBQUksSUFBSyxtQkFBbUIsVUFBVSxRQUFRLElBQUksQ0FBQyxPQUFRO3dCQUN6RSxJQUFJLE9BQU8sUUFBUSxVQUFVOzRCQUMzQixJQUFJLFdBQVcsSUFBSSxFQUFFO2dDQUNuQixZQUFZLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTs0QkFDOUQsT0FBTztnQ0FDTCxVQUFVLElBQUksQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJOzRCQUNuQyxDQUFDO3dCQUNILENBQUM7d0JBRUQsMkJBQTJCO3dCQUMzQix3QkFBd0I7d0JBQ3hCLDZCQUE2Qjt3QkFDN0IsdURBQXVEO3dCQUN2RCw4Q0FBOEM7d0JBQzlDLGlEQUFpRDt3QkFDakQsSUFBSSxPQUFPLFNBQVMsWUFBWSxDQUFDLFNBQVM7NEJBQ3hDLE1BQU0sQ0FBQyxLQUFLLEdBQUc7d0JBQ2pCLE9BQU87NEJBQ0wsSUFBSSxLQUFLLFFBQVEsQ0FBQyxLQUFLLElBQUksS0FBSyxRQUFRLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRTtnQ0FDNUQsTUFBTSxDQUFDLEtBQUssR0FBRzs0QkFDakIsQ0FBQzt3QkFDSCxDQUFDO29CQUNILENBQUM7Z0JBQ0g7WUFDRjtZQUVBLFdBQVc7UUFDYjtRQUVBLE1BQU0sT0FBTSxZQUFZLE1BQU07UUFDOUIsSUFBSSxTQUFRLEdBQUcsT0FBTyxJQUFJO1FBQzFCLElBQUksU0FBUSxHQUFHLE9BQU87WUFBRSxVQUFVO2dCQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTzthQUFDO1lBQUU7UUFBTztRQUVuRSxNQUFNLFdBQVcsWUFDZCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQU07WUFDZCxPQUFPLEVBQUUsS0FBSyxHQUFHLEVBQUUsS0FBSztRQUMxQixHQUNDLEdBQUcsQ0FBQyxDQUFDLElBQU07WUFDVixPQUFPLEVBQUUsT0FBTztRQUNsQjtRQUVGLE9BQU87WUFBRTtZQUFVO1FBQU87SUFDNUI7QUFDRixDQUFDIn0=