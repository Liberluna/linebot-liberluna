import { getFilePath } from '../../utils/filepath.ts';
import { getMimeType } from '../../utils/mime.ts';
const DEFAULT_DOCUMENT = 'index.html';
export const serveStatic = (options = {
    root: ''
})=>{
    return async (c, next)=>{
        // Do nothing if Response is already set
        if (c.finalized) {
            await next();
            return;
        }
        const url = new URL(c.req.url);
        let path = getFilePath({
            filename: options.path ?? decodeURI(url.pathname),
            root: options.root,
            defaultDocument: DEFAULT_DOCUMENT
        });
        path = `./${path}`;
        let content;
        try {
            content = await Deno.readFile(path);
        } catch (e) {
            console.warn(`${e}`);
        }
        if (content) {
            const mimeType = getMimeType(path);
            if (mimeType) {
                c.header('Content-Type', mimeType);
            }
            // Return Response object
            return c.body(content);
        } else {
            console.warn(`Static file: ${path} is not found`);
            await next();
        }
        return;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvYWRhcHRlci9kZW5vL3NlcnZlLXN0YXRpYy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi8uLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBOZXh0IH0gZnJvbSAnLi4vLi4vdHlwZXMudHMnXG5pbXBvcnQgeyBnZXRGaWxlUGF0aCB9IGZyb20gJy4uLy4uL3V0aWxzL2ZpbGVwYXRoLnRzJ1xuaW1wb3J0IHsgZ2V0TWltZVR5cGUgfSBmcm9tICcuLi8uLi91dGlscy9taW1lLnRzJ1xuXG5leHBvcnQgdHlwZSBTZXJ2ZVN0YXRpY09wdGlvbnMgPSB7XG4gIHJvb3Q/OiBzdHJpbmdcbiAgcGF0aD86IHN0cmluZ1xufVxuXG5jb25zdCBERUZBVUxUX0RPQ1VNRU5UID0gJ2luZGV4Lmh0bWwnXG5cbmV4cG9ydCBjb25zdCBzZXJ2ZVN0YXRpYyA9IChvcHRpb25zOiBTZXJ2ZVN0YXRpY09wdGlvbnMgPSB7IHJvb3Q6ICcnIH0pID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjOiBDb250ZXh0LCBuZXh0OiBOZXh0KSA9PiB7XG4gICAgLy8gRG8gbm90aGluZyBpZiBSZXNwb25zZSBpcyBhbHJlYWR5IHNldFxuICAgIGlmIChjLmZpbmFsaXplZCkge1xuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBuZXcgVVJMKGMucmVxLnVybClcblxuICAgIGxldCBwYXRoID0gZ2V0RmlsZVBhdGgoe1xuICAgICAgZmlsZW5hbWU6IG9wdGlvbnMucGF0aCA/PyBkZWNvZGVVUkkodXJsLnBhdGhuYW1lKSxcbiAgICAgIHJvb3Q6IG9wdGlvbnMucm9vdCxcbiAgICAgIGRlZmF1bHREb2N1bWVudDogREVGQVVMVF9ET0NVTUVOVCxcbiAgICB9KVxuXG4gICAgcGF0aCA9IGAuLyR7cGF0aH1gXG5cbiAgICBsZXQgY29udGVudFxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnRlbnQgPSBhd2FpdCBEZW5vLnJlYWRGaWxlKHBhdGgpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS53YXJuKGAke2V9YClcbiAgICB9XG5cbiAgICBpZiAoY29udGVudCkge1xuICAgICAgY29uc3QgbWltZVR5cGUgPSBnZXRNaW1lVHlwZShwYXRoKVxuICAgICAgaWYgKG1pbWVUeXBlKSB7XG4gICAgICAgIGMuaGVhZGVyKCdDb250ZW50LVR5cGUnLCBtaW1lVHlwZSlcbiAgICAgIH1cbiAgICAgIC8vIFJldHVybiBSZXNwb25zZSBvYmplY3RcbiAgICAgIHJldHVybiBjLmJvZHkoY29udGVudClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBTdGF0aWMgZmlsZTogJHtwYXRofSBpcyBub3QgZm91bmRgKVxuICAgICAgYXdhaXQgbmV4dCgpXG4gICAgfVxuICAgIHJldHVyblxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsU0FBUyxXQUFXLFFBQVEsMEJBQXlCO0FBQ3JELFNBQVMsV0FBVyxRQUFRLHNCQUFxQjtBQU9qRCxNQUFNLG1CQUFtQjtBQUV6QixPQUFPLE1BQU0sY0FBYyxDQUFDLFVBQThCO0lBQUUsTUFBTTtBQUFHLENBQUMsR0FBSztJQUN6RSxPQUFPLE9BQU8sR0FBWSxPQUFlO1FBQ3ZDLHdDQUF3QztRQUN4QyxJQUFJLEVBQUUsU0FBUyxFQUFFO1lBQ2YsTUFBTTtZQUNOO1FBQ0YsQ0FBQztRQUVELE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRSxHQUFHLENBQUMsR0FBRztRQUU3QixJQUFJLE9BQU8sWUFBWTtZQUNyQixVQUFVLFFBQVEsSUFBSSxJQUFJLFVBQVUsSUFBSSxRQUFRO1lBQ2hELE1BQU0sUUFBUSxJQUFJO1lBQ2xCLGlCQUFpQjtRQUNuQjtRQUVBLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDO1FBRWxCLElBQUk7UUFFSixJQUFJO1lBQ0YsVUFBVSxNQUFNLEtBQUssUUFBUSxDQUFDO1FBQ2hDLEVBQUUsT0FBTyxHQUFHO1lBQ1YsUUFBUSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNyQjtRQUVBLElBQUksU0FBUztZQUNYLE1BQU0sV0FBVyxZQUFZO1lBQzdCLElBQUksVUFBVTtnQkFDWixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7WUFDM0IsQ0FBQztZQUNELHlCQUF5QjtZQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDO1FBQ2hCLE9BQU87WUFDTCxRQUFRLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxLQUFLLGFBQWEsQ0FBQztZQUNoRCxNQUFNO1FBQ1IsQ0FBQztRQUNEO0lBQ0Y7QUFDRixFQUFDIn0=