import { checkOptionalParameter } from '../../utils/url.ts';
import { Node } from './node.ts';
export class TrieRouter {
    node;
    constructor(){
        this.node = new Node();
    }
    add(method, path, handler) {
        const results = checkOptionalParameter(path);
        if (results) {
            for (const p of results){
                this.node.insert(method, p, handler);
            }
            return;
        }
        this.node.insert(method, path, handler);
    }
    match(method, path) {
        return this.node.search(method, path);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvcm91dGVyL3RyaWUtcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFJlc3VsdCwgUm91dGVyIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgY2hlY2tPcHRpb25hbFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC50cydcbmltcG9ydCB7IE5vZGUgfSBmcm9tICcuL25vZGUudHMnXG5cbmV4cG9ydCBjbGFzcyBUcmllUm91dGVyPFQ+IGltcGxlbWVudHMgUm91dGVyPFQ+IHtcbiAgbm9kZTogTm9kZTxUPlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubm9kZSA9IG5ldyBOb2RlKClcbiAgfVxuXG4gIGFkZChtZXRob2Q6IHN0cmluZywgcGF0aDogc3RyaW5nLCBoYW5kbGVyOiBUKSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IGNoZWNrT3B0aW9uYWxQYXJhbWV0ZXIocGF0aClcbiAgICBpZiAocmVzdWx0cykge1xuICAgICAgZm9yIChjb25zdCBwIG9mIHJlc3VsdHMpIHtcbiAgICAgICAgdGhpcy5ub2RlLmluc2VydChtZXRob2QsIHAsIGhhbmRsZXIpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuaW5zZXJ0KG1ldGhvZCwgcGF0aCwgaGFuZGxlcilcbiAgfVxuXG4gIG1hdGNoKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBSZXN1bHQ8VD4gfCBudWxsIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLnNlYXJjaChtZXRob2QsIHBhdGgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLHNCQUFzQixRQUFRLHFCQUFvQjtBQUMzRCxTQUFTLElBQUksUUFBUSxZQUFXO0FBRWhDLE9BQU8sTUFBTTtJQUNYLEtBQWE7SUFFYixhQUFjO1FBQ1osSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO0lBQ2xCO0lBRUEsSUFBSSxNQUFjLEVBQUUsSUFBWSxFQUFFLE9BQVUsRUFBRTtRQUM1QyxNQUFNLFVBQVUsdUJBQXVCO1FBQ3ZDLElBQUksU0FBUztZQUNYLEtBQUssTUFBTSxLQUFLLFFBQVM7Z0JBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRztZQUM5QjtZQUNBO1FBQ0YsQ0FBQztRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsTUFBTTtJQUNqQztJQUVBLE1BQU0sTUFBYyxFQUFFLElBQVksRUFBb0I7UUFDcEQsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO0lBQ2xDO0FBQ0YsQ0FBQyJ9