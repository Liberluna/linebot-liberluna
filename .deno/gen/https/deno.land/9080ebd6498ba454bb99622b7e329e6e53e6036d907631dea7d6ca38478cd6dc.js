/* eslint-disable @typescript-eslint/ban-ts-comment */ import { UnsupportedPathError } from '../../router.ts';
export class SmartRouter {
    routers = [];
    routes = [];
    constructor(init){
        Object.assign(this, init);
    }
    add(method, path, handler) {
        if (!this.routes) {
            throw new Error('Can not add a route since the matcher is already built.');
        }
        this.routes.push([
            method,
            path,
            handler
        ]);
    }
    match(method, path) {
        if (!this.routes) {
            throw new Error('Fatal error');
        }
        const { routers , routes  } = this;
        const len = routers.length;
        let i = 0;
        let res;
        for(; i < len; i++){
            const router = routers[i];
            try {
                routes.forEach((args)=>{
                    router.add(...args);
                });
                res = router.match(method, path);
            } catch (e) {
                if (e instanceof UnsupportedPathError) {
                    continue;
                }
                throw e;
            }
            this.match = router.match.bind(router);
            this.routers = [
                router
            ];
            this.routes = undefined;
            break;
        }
        if (i === len) {
            // not found
            throw new Error('Fatal error');
        }
        return res || null;
    }
    get activeRouter() {
        if (this.routes || this.routers.length !== 1) {
            throw new Error('No active router has been determined yet.');
        }
        return this.routers[0];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvcm91dGVyL3NtYXJ0LXJvdXRlci9yb3V0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50ICovXG5pbXBvcnQgdHlwZSB7IFJvdXRlciwgUmVzdWx0IH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgVW5zdXBwb3J0ZWRQYXRoRXJyb3IgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5cbmV4cG9ydCBjbGFzcyBTbWFydFJvdXRlcjxUPiBpbXBsZW1lbnRzIFJvdXRlcjxUPiB7XG4gIHJvdXRlcnM6IFJvdXRlcjxUPltdID0gW11cbiAgcm91dGVzPzogW3N0cmluZywgc3RyaW5nLCBUXVtdID0gW11cblxuICBjb25zdHJ1Y3Rvcihpbml0OiBQaWNrPFNtYXJ0Um91dGVyPFQ+LCAncm91dGVycyc+KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLCBpbml0KVxuICB9XG5cbiAgYWRkKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcsIGhhbmRsZXI6IFQpIHtcbiAgICBpZiAoIXRoaXMucm91dGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgYWRkIGEgcm91dGUgc2luY2UgdGhlIG1hdGNoZXIgaXMgYWxyZWFkeSBidWlsdC4nKVxuICAgIH1cblxuICAgIHRoaXMucm91dGVzLnB1c2goW21ldGhvZCwgcGF0aCwgaGFuZGxlcl0pXG4gIH1cblxuICBtYXRjaChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nKTogUmVzdWx0PFQ+IHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLnJvdXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYXRhbCBlcnJvcicpXG4gICAgfVxuXG4gICAgY29uc3QgeyByb3V0ZXJzLCByb3V0ZXMgfSA9IHRoaXNcbiAgICBjb25zdCBsZW4gPSByb3V0ZXJzLmxlbmd0aFxuICAgIGxldCBpID0gMFxuICAgIGxldCByZXNcbiAgICBmb3IgKDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBjb25zdCByb3V0ZXIgPSByb3V0ZXJzW2ldXG4gICAgICB0cnkge1xuICAgICAgICByb3V0ZXMuZm9yRWFjaCgoYXJncykgPT4ge1xuICAgICAgICAgIHJvdXRlci5hZGQoLi4uYXJncylcbiAgICAgICAgfSlcbiAgICAgICAgcmVzID0gcm91dGVyLm1hdGNoKG1ldGhvZCwgcGF0aClcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBVbnN1cHBvcnRlZFBhdGhFcnJvcikge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZVxuICAgICAgfVxuXG4gICAgICB0aGlzLm1hdGNoID0gcm91dGVyLm1hdGNoLmJpbmQocm91dGVyKVxuICAgICAgdGhpcy5yb3V0ZXJzID0gW3JvdXRlcl1cbiAgICAgIHRoaXMucm91dGVzID0gdW5kZWZpbmVkXG4gICAgICBicmVha1xuICAgIH1cblxuICAgIGlmIChpID09PSBsZW4pIHtcbiAgICAgIC8vIG5vdCBmb3VuZFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYXRhbCBlcnJvcicpXG4gICAgfVxuXG4gICAgcmV0dXJuIHJlcyB8fCBudWxsXG4gIH1cblxuICBnZXQgYWN0aXZlUm91dGVyKCkge1xuICAgIGlmICh0aGlzLnJvdXRlcyB8fCB0aGlzLnJvdXRlcnMubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGFjdGl2ZSByb3V0ZXIgaGFzIGJlZW4gZGV0ZXJtaW5lZCB5ZXQuJylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5yb3V0ZXJzWzBdXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvREFBb0QsR0FDcEQsQUFDQSxTQUFTLG9CQUFvQixRQUFRLGtCQUFpQjtBQUV0RCxPQUFPLE1BQU07SUFDWCxVQUF1QixFQUFFLENBQUE7SUFDekIsU0FBaUMsRUFBRSxDQUFBO0lBRW5DLFlBQVksSUFBcUMsQ0FBRTtRQUNqRCxPQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUU7SUFDdEI7SUFFQSxJQUFJLE1BQWMsRUFBRSxJQUFZLEVBQUUsT0FBVSxFQUFFO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxNQUFNLDJEQUEwRDtRQUM1RSxDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFBQztZQUFRO1lBQU07U0FBUTtJQUMxQztJQUVBLE1BQU0sTUFBYyxFQUFFLElBQVksRUFBb0I7UUFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDaEIsTUFBTSxJQUFJLE1BQU0sZUFBYztRQUNoQyxDQUFDO1FBRUQsTUFBTSxFQUFFLFFBQU8sRUFBRSxPQUFNLEVBQUUsR0FBRyxJQUFJO1FBQ2hDLE1BQU0sTUFBTSxRQUFRLE1BQU07UUFDMUIsSUFBSSxJQUFJO1FBQ1IsSUFBSTtRQUNKLE1BQU8sSUFBSSxLQUFLLElBQUs7WUFDbkIsTUFBTSxTQUFTLE9BQU8sQ0FBQyxFQUFFO1lBQ3pCLElBQUk7Z0JBQ0YsT0FBTyxPQUFPLENBQUMsQ0FBQyxPQUFTO29CQUN2QixPQUFPLEdBQUcsSUFBSTtnQkFDaEI7Z0JBQ0EsTUFBTSxPQUFPLEtBQUssQ0FBQyxRQUFRO1lBQzdCLEVBQUUsT0FBTyxHQUFHO2dCQUNWLElBQUksYUFBYSxzQkFBc0I7b0JBQ3JDLFFBQVE7Z0JBQ1YsQ0FBQztnQkFDRCxNQUFNLEVBQUM7WUFDVDtZQUVBLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUc7Z0JBQUM7YUFBTztZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHO1lBQ2QsS0FBSztRQUNQO1FBRUEsSUFBSSxNQUFNLEtBQUs7WUFDYixZQUFZO1lBQ1osTUFBTSxJQUFJLE1BQU0sZUFBYztRQUNoQyxDQUFDO1FBRUQsT0FBTyxPQUFPLElBQUk7SUFDcEI7SUFFQSxJQUFJLGVBQWU7UUFDakIsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLEdBQUc7WUFDNUMsTUFBTSxJQUFJLE1BQU0sNkNBQTRDO1FBQzlELENBQUM7UUFFRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUN4QjtBQUNGLENBQUMifQ==