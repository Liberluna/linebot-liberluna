export const decodeBase64Url = (str)=>{
    return decodeBase64(str.replace(/_|-/g, (m)=>({
            _: '/',
            '-': '+'
        })[m] ?? m));
};
export const encodeBase64Url = (buf)=>encodeBase64(buf).replace(/\/|\+/g, (m)=>({
            '/': '_',
            '+': '-'
        })[m] ?? m);
// This approach is written in MDN.
// btoa does not support utf-8 characters. So we need a little bit hack.
export const encodeBase64 = (buf)=>{
    const binary = String.fromCharCode(...new Uint8Array(buf));
    return btoa(binary);
};
// atob does not support utf-8 characters. So we need a little bit hack.
export const decodeBase64 = (str)=>{
    const binary = atob(str);
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    const half = binary.length / 2;
    for(let i = 0, j = binary.length - 1; i <= half; i++, j--){
        bytes[i] = binary.charCodeAt(i);
        bytes[j] = binary.charCodeAt(j);
    }
    return bytes;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdXRpbHMvZW5jb2RlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBkZWNvZGVCYXNlNjRVcmwgPSAoc3RyOiBzdHJpbmcpOiBVaW50OEFycmF5ID0+IHtcbiAgcmV0dXJuIGRlY29kZUJhc2U2NChzdHIucmVwbGFjZSgvX3wtL2csIChtKSA9PiAoeyBfOiAnLycsICctJzogJysnIH1bbV0gPz8gbSkpKVxufVxuXG5leHBvcnQgY29uc3QgZW5jb2RlQmFzZTY0VXJsID0gKGJ1ZjogQXJyYXlCdWZmZXJMaWtlKTogc3RyaW5nID0+XG4gIGVuY29kZUJhc2U2NChidWYpLnJlcGxhY2UoL1xcL3xcXCsvZywgKG0pID0+ICh7ICcvJzogJ18nLCAnKyc6ICctJyB9W21dID8/IG0pKVxuXG4vLyBUaGlzIGFwcHJvYWNoIGlzIHdyaXR0ZW4gaW4gTUROLlxuLy8gYnRvYSBkb2VzIG5vdCBzdXBwb3J0IHV0Zi04IGNoYXJhY3RlcnMuIFNvIHdlIG5lZWQgYSBsaXR0bGUgYml0IGhhY2suXG5leHBvcnQgY29uc3QgZW5jb2RlQmFzZTY0ID0gKGJ1ZjogQXJyYXlCdWZmZXJMaWtlKTogc3RyaW5nID0+IHtcbiAgY29uc3QgYmluYXJ5ID0gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5uZXcgVWludDhBcnJheShidWYpKVxuICByZXR1cm4gYnRvYShiaW5hcnkpXG59XG5cbi8vIGF0b2IgZG9lcyBub3Qgc3VwcG9ydCB1dGYtOCBjaGFyYWN0ZXJzLiBTbyB3ZSBuZWVkIGEgbGl0dGxlIGJpdCBoYWNrLlxuZXhwb3J0IGNvbnN0IGRlY29kZUJhc2U2NCA9IChzdHI6IHN0cmluZyk6IFVpbnQ4QXJyYXkgPT4ge1xuICBjb25zdCBiaW5hcnkgPSBhdG9iKHN0cilcbiAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShuZXcgQXJyYXlCdWZmZXIoYmluYXJ5Lmxlbmd0aCkpXG4gIGNvbnN0IGhhbGYgPSBiaW5hcnkubGVuZ3RoIC8gMlxuICBmb3IgKGxldCBpID0gMCwgaiA9IGJpbmFyeS5sZW5ndGggLSAxOyBpIDw9IGhhbGY7IGkrKywgai0tKSB7XG4gICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKVxuICAgIGJ5dGVzW2pdID0gYmluYXJ5LmNoYXJDb2RlQXQoailcbiAgfVxuICByZXR1cm4gYnl0ZXNcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sa0JBQWtCLENBQUMsTUFBNEI7SUFDMUQsT0FBTyxhQUFhLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFPLENBQUE7WUFBRSxHQUFHO1lBQUssS0FBSztRQUFJLENBQUEsQ0FBQyxDQUFDLEVBQUUsSUFBSTtBQUM3RSxFQUFDO0FBRUQsT0FBTyxNQUFNLGtCQUFrQixDQUFDLE1BQzlCLGFBQWEsS0FBSyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQU8sQ0FBQTtZQUFFLEtBQUs7WUFBSyxLQUFLO1FBQUksQ0FBQSxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUc7QUFFOUUsbUNBQW1DO0FBQ25DLHdFQUF3RTtBQUN4RSxPQUFPLE1BQU0sZUFBZSxDQUFDLE1BQWlDO0lBQzVELE1BQU0sU0FBUyxPQUFPLFlBQVksSUFBSSxJQUFJLFdBQVc7SUFDckQsT0FBTyxLQUFLO0FBQ2QsRUFBQztBQUVELHdFQUF3RTtBQUN4RSxPQUFPLE1BQU0sZUFBZSxDQUFDLE1BQTRCO0lBQ3ZELE1BQU0sU0FBUyxLQUFLO0lBQ3BCLE1BQU0sUUFBUSxJQUFJLFdBQVcsSUFBSSxZQUFZLE9BQU8sTUFBTTtJQUMxRCxNQUFNLE9BQU8sT0FBTyxNQUFNLEdBQUc7SUFDN0IsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sTUFBTSxHQUFHLEdBQUcsS0FBSyxNQUFNLEtBQUssR0FBRyxDQUFFO1FBQzFELEtBQUssQ0FBQyxFQUFFLEdBQUcsT0FBTyxVQUFVLENBQUM7UUFDN0IsS0FBSyxDQUFDLEVBQUUsR0FBRyxPQUFPLFVBQVUsQ0FBQztJQUMvQjtJQUNBLE9BQU87QUFDVCxFQUFDIn0=