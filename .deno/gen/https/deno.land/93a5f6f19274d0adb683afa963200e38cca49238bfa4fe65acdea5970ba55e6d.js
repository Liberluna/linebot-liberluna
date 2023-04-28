export const splitPath = (path)=>{
    const paths = path.split('/');
    if (paths[0] === '') {
        paths.shift();
    }
    return paths;
};
export const splitRoutingPath = (path)=>{
    const groups = [] // [mark, original string]
    ;
    for(let i = 0;;){
        let replaced = false;
        path = path.replace(/\{[^}]+\}/g, (m)=>{
            const mark = `@\\${i}`;
            groups[i] = [
                mark,
                m
            ];
            i++;
            replaced = true;
            return mark;
        });
        if (!replaced) {
            break;
        }
    }
    const paths = path.split('/');
    if (paths[0] === '') {
        paths.shift();
    }
    for(let i1 = groups.length - 1; i1 >= 0; i1--){
        const [mark] = groups[i1];
        for(let j = paths.length - 1; j >= 0; j--){
            if (paths[j].indexOf(mark) !== -1) {
                paths[j] = paths[j].replace(mark, groups[i1][1]);
                break;
            }
        }
    }
    return paths;
};
const patternCache = {};
export const getPattern = (label)=>{
    // *            => wildcard
    // :id{[0-9]+}  => ([0-9]+)
    // :id          => (.+)
    //const name = ''
    if (label === '*') {
        return '*';
    }
    const match = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    if (match) {
        if (!patternCache[label]) {
            if (match[2]) {
                patternCache[label] = [
                    label,
                    match[1],
                    new RegExp('^' + match[2] + '$')
                ];
            } else {
                patternCache[label] = [
                    label,
                    match[1],
                    true
                ];
            }
        }
        return patternCache[label];
    }
    return null;
};
export const getPathFromURL = (url, strict = true)=>{
    const queryIndex = url.indexOf('?', 8);
    const result = url.substring(url.indexOf('/', 8), queryIndex === -1 ? url.length : queryIndex);
    // if strict routing is false => `/hello/hey/` and `/hello/hey` are treated the same
    // default is true
    if (strict === false && /.+\/$/.test(result)) {
        return result.slice(0, -1);
    }
    return result;
};
export const mergePath = (...paths)=>{
    let p = '';
    let endsWithSlash = false;
    for (let path of paths){
        /* ['/hey/','/say'] => ['/hey', '/say'] */ if (p.endsWith('/')) {
            p = p.slice(0, -1);
            endsWithSlash = true;
        }
        /* ['/hey','say'] => ['/hey', '/say'] */ if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        /* ['/hey/', '/'] => `/hey/` */ if (path === '/' && endsWithSlash) {
            p = `${p}/`;
        } else if (path !== '/') {
            p = `${p}${path}`;
        }
        /* ['/', '/'] => `/` */ if (path === '/' && p === '') {
            p = '/';
        }
    }
    return p;
};
export const checkOptionalParameter = (path)=>{
    /*
   If path is `/api/animals/:type?` it will return:
   [`/api/animals`, `/api/animals/:type`]
   in other cases it will return null
   */ const match = path.match(/^(.+|)(\/\:[^\/]+)\?$/);
    if (!match) return null;
    const base = match[1];
    const optional = base + match[2];
    return [
        base === '' ? '/' : base.replace(/\/$/, ''),
        optional
    ];
};
// Optimized
const _decodeURI = (value)=>{
    if (!/[%+]/.test(value)) {
        return value;
    }
    if (value.includes('+')) {
        value = value.replace(/\+/g, ' ');
    }
    return value.includes('%') ? decodeURIComponent(value) : value;
};
const _getQueryParam = (url, key, multiple)=>{
    let encoded;
    if (!multiple && key && !/[%+]/.test(key)) {
        // optimized for unencoded key
        let keyIndex = url.indexOf(`?${key}`, 8);
        if (keyIndex === -1) {
            keyIndex = url.indexOf(`&${key}`, 8);
        }
        while(keyIndex !== -1){
            const trailingKeyCode = url.charCodeAt(keyIndex + key.length + 1);
            if (trailingKeyCode === 61) {
                const valueIndex = keyIndex + key.length + 2;
                const endIndex = url.indexOf('&', valueIndex);
                return _decodeURI(url.slice(valueIndex, endIndex === -1 ? undefined : endIndex));
            } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
                return '';
            }
            keyIndex = url.indexOf(`&${key}`, keyIndex);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
            return undefined;
        }
    // fallback to default routine
    }
    const results = {};
    encoded ??= /[%+]/.test(url);
    let keyIndex1 = url.indexOf('?', 8);
    while(keyIndex1 !== -1){
        const nextKeyIndex = url.indexOf('&', keyIndex1 + 1);
        let valueIndex1 = url.indexOf('=', keyIndex1);
        if (valueIndex1 > nextKeyIndex && nextKeyIndex !== -1) {
            valueIndex1 = -1;
        }
        let name = url.slice(keyIndex1 + 1, valueIndex1 === -1 ? nextKeyIndex === -1 ? undefined : nextKeyIndex : valueIndex1);
        if (encoded) {
            name = _decodeURI(name);
        }
        keyIndex1 = nextKeyIndex;
        if (name === '') {
            continue;
        }
        let value;
        if (valueIndex1 === -1) {
            value = '';
        } else {
            value = url.slice(valueIndex1 + 1, nextKeyIndex === -1 ? undefined : nextKeyIndex);
            if (encoded) {
                value = _decodeURI(value);
            }
        }
        if (multiple) {
            (results[name] ??= []).push(value);
        } else {
            results[name] ??= value;
        }
    }
    return key ? results[key] : results;
};
export const getQueryParam = _getQueryParam;
export const getQueryParams = (url, key)=>{
    return _getQueryParam(url, key, true);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdXRpbHMvdXJsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCB0eXBlIFBhdHRlcm4gPSByZWFkb25seSBbc3RyaW5nLCBzdHJpbmcsIFJlZ0V4cCB8IHRydWVdIHwgJyonXG5cbmV4cG9ydCBjb25zdCBzcGxpdFBhdGggPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gPT4ge1xuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIHJldHVybiBwYXRoc1xufVxuXG5leHBvcnQgY29uc3Qgc3BsaXRSb3V0aW5nUGF0aCA9IChwYXRoOiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gIGNvbnN0IGdyb3VwczogW3N0cmluZywgc3RyaW5nXVtdID0gW10gLy8gW21hcmssIG9yaWdpbmFsIHN0cmluZ11cbiAgZm9yIChsZXQgaSA9IDA7IDsgKSB7XG4gICAgbGV0IHJlcGxhY2VkID0gZmFsc2VcbiAgICBwYXRoID0gcGF0aC5yZXBsYWNlKC9cXHtbXn1dK1xcfS9nLCAobSkgPT4ge1xuICAgICAgY29uc3QgbWFyayA9IGBAXFxcXCR7aX1gXG4gICAgICBncm91cHNbaV0gPSBbbWFyaywgbV1cbiAgICAgIGkrK1xuICAgICAgcmVwbGFjZWQgPSB0cnVlXG4gICAgICByZXR1cm4gbWFya1xuICAgIH0pXG4gICAgaWYgKCFyZXBsYWNlZCkge1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwYXRocyA9IHBhdGguc3BsaXQoJy8nKVxuICBpZiAocGF0aHNbMF0gPT09ICcnKSB7XG4gICAgcGF0aHMuc2hpZnQoKVxuICB9XG4gIGZvciAobGV0IGkgPSBncm91cHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCBbbWFya10gPSBncm91cHNbaV1cbiAgICBmb3IgKGxldCBqID0gcGF0aHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgIGlmIChwYXRoc1tqXS5pbmRleE9mKG1hcmspICE9PSAtMSkge1xuICAgICAgICBwYXRoc1tqXSA9IHBhdGhzW2pdLnJlcGxhY2UobWFyaywgZ3JvdXBzW2ldWzFdKVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBwYXRoc1xufVxuXG5jb25zdCBwYXR0ZXJuQ2FjaGU6IHsgW2tleTogc3RyaW5nXTogUGF0dGVybiB9ID0ge31cbmV4cG9ydCBjb25zdCBnZXRQYXR0ZXJuID0gKGxhYmVsOiBzdHJpbmcpOiBQYXR0ZXJuIHwgbnVsbCA9PiB7XG4gIC8vICogICAgICAgICAgICA9PiB3aWxkY2FyZFxuICAvLyA6aWR7WzAtOV0rfSAgPT4gKFswLTldKylcbiAgLy8gOmlkICAgICAgICAgID0+ICguKylcbiAgLy9jb25zdCBuYW1lID0gJydcblxuICBpZiAobGFiZWwgPT09ICcqJykge1xuICAgIHJldHVybiAnKidcbiAgfVxuXG4gIGNvbnN0IG1hdGNoID0gbGFiZWwubWF0Y2goL15cXDooW15cXHtcXH1dKykoPzpcXHsoLispXFx9KT8kLylcbiAgaWYgKG1hdGNoKSB7XG4gICAgaWYgKCFwYXR0ZXJuQ2FjaGVbbGFiZWxdKSB7XG4gICAgICBpZiAobWF0Y2hbMl0pIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIG5ldyBSZWdFeHAoJ14nICsgbWF0Y2hbMl0gKyAnJCcpXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGF0dGVybkNhY2hlW2xhYmVsXSA9IFtsYWJlbCwgbWF0Y2hbMV0sIHRydWVdXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdHRlcm5DYWNoZVtsYWJlbF1cbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG5cbmV4cG9ydCBjb25zdCBnZXRQYXRoRnJvbVVSTCA9ICh1cmw6IHN0cmluZywgc3RyaWN0OiBib29sZWFuID0gdHJ1ZSk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHF1ZXJ5SW5kZXggPSB1cmwuaW5kZXhPZignPycsIDgpXG4gIGNvbnN0IHJlc3VsdCA9IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoJy8nLCA4KSwgcXVlcnlJbmRleCA9PT0gLTEgPyB1cmwubGVuZ3RoIDogcXVlcnlJbmRleClcblxuICAvLyBpZiBzdHJpY3Qgcm91dGluZyBpcyBmYWxzZSA9PiBgL2hlbGxvL2hleS9gIGFuZCBgL2hlbGxvL2hleWAgYXJlIHRyZWF0ZWQgdGhlIHNhbWVcbiAgLy8gZGVmYXVsdCBpcyB0cnVlXG4gIGlmIChzdHJpY3QgPT09IGZhbHNlICYmIC8uK1xcLyQvLnRlc3QocmVzdWx0KSkge1xuICAgIHJldHVybiByZXN1bHQuc2xpY2UoMCwgLTEpXG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG59XG5cbmV4cG9ydCBjb25zdCBtZXJnZVBhdGggPSAoLi4ucGF0aHM6IHN0cmluZ1tdKTogc3RyaW5nID0+IHtcbiAgbGV0IHA6IHN0cmluZyA9ICcnXG4gIGxldCBlbmRzV2l0aFNsYXNoID0gZmFsc2VcblxuICBmb3IgKGxldCBwYXRoIG9mIHBhdGhzKSB7XG4gICAgLyogWycvaGV5LycsJy9zYXknXSA9PiBbJy9oZXknLCAnL3NheSddICovXG4gICAgaWYgKHAuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgcCA9IHAuc2xpY2UoMCwgLTEpXG4gICAgICBlbmRzV2l0aFNsYXNoID0gdHJ1ZVxuICAgIH1cblxuICAgIC8qIFsnL2hleScsJ3NheSddID0+IFsnL2hleScsICcvc2F5J10gKi9cbiAgICBpZiAoIXBhdGguc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBwYXRoID0gYC8ke3BhdGh9YFxuICAgIH1cblxuICAgIC8qIFsnL2hleS8nLCAnLyddID0+IGAvaGV5L2AgKi9cbiAgICBpZiAocGF0aCA9PT0gJy8nICYmIGVuZHNXaXRoU2xhc2gpIHtcbiAgICAgIHAgPSBgJHtwfS9gXG4gICAgfSBlbHNlIGlmIChwYXRoICE9PSAnLycpIHtcbiAgICAgIHAgPSBgJHtwfSR7cGF0aH1gXG4gICAgfVxuXG4gICAgLyogWycvJywgJy8nXSA9PiBgL2AgKi9cbiAgICBpZiAocGF0aCA9PT0gJy8nICYmIHAgPT09ICcnKSB7XG4gICAgICBwID0gJy8nXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBcbn1cblxuZXhwb3J0IGNvbnN0IGNoZWNrT3B0aW9uYWxQYXJhbWV0ZXIgPSAocGF0aDogc3RyaW5nKTogc3RyaW5nW10gfCBudWxsID0+IHtcbiAgLypcbiAgIElmIHBhdGggaXMgYC9hcGkvYW5pbWFscy86dHlwZT9gIGl0IHdpbGwgcmV0dXJuOlxuICAgW2AvYXBpL2FuaW1hbHNgLCBgL2FwaS9hbmltYWxzLzp0eXBlYF1cbiAgIGluIG90aGVyIGNhc2VzIGl0IHdpbGwgcmV0dXJuIG51bGxcbiAgICovXG4gIGNvbnN0IG1hdGNoID0gcGF0aC5tYXRjaCgvXiguK3wpKFxcL1xcOlteXFwvXSspXFw/JC8pXG4gIGlmICghbWF0Y2gpIHJldHVybiBudWxsXG5cbiAgY29uc3QgYmFzZSA9IG1hdGNoWzFdXG4gIGNvbnN0IG9wdGlvbmFsID0gYmFzZSArIG1hdGNoWzJdXG4gIHJldHVybiBbYmFzZSA9PT0gJycgPyAnLycgOiBiYXNlLnJlcGxhY2UoL1xcLyQvLCAnJyksIG9wdGlvbmFsXVxufVxuXG4vLyBPcHRpbWl6ZWRcbmNvbnN0IF9kZWNvZGVVUkkgPSAodmFsdWU6IHN0cmluZykgPT4ge1xuICBpZiAoIS9bJStdLy50ZXN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGlmICh2YWx1ZS5pbmNsdWRlcygnKycpKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICB9XG4gIHJldHVybiB2YWx1ZS5pbmNsdWRlcygnJScpID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSA6IHZhbHVlXG59XG5cbmNvbnN0IF9nZXRRdWVyeVBhcmFtID0gKFxuICB1cmw6IHN0cmluZyxcbiAga2V5Pzogc3RyaW5nLFxuICBtdWx0aXBsZT86IGJvb2xlYW5cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBzdHJpbmdbXSB8IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9PiB7XG4gIGxldCBlbmNvZGVkXG5cbiAgaWYgKCFtdWx0aXBsZSAmJiBrZXkgJiYgIS9bJStdLy50ZXN0KGtleSkpIHtcbiAgICAvLyBvcHRpbWl6ZWQgZm9yIHVuZW5jb2RlZCBrZXlcblxuICAgIGxldCBrZXlJbmRleCA9IHVybC5pbmRleE9mKGA/JHtrZXl9YCwgOClcbiAgICBpZiAoa2V5SW5kZXggPT09IC0xKSB7XG4gICAgICBrZXlJbmRleCA9IHVybC5pbmRleE9mKGAmJHtrZXl9YCwgOClcbiAgICB9XG4gICAgd2hpbGUgKGtleUluZGV4ICE9PSAtMSkge1xuICAgICAgY29uc3QgdHJhaWxpbmdLZXlDb2RlID0gdXJsLmNoYXJDb2RlQXQoa2V5SW5kZXggKyBrZXkubGVuZ3RoICsgMSlcbiAgICAgIGlmICh0cmFpbGluZ0tleUNvZGUgPT09IDYxKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlSW5kZXggPSBrZXlJbmRleCArIGtleS5sZW5ndGggKyAyXG4gICAgICAgIGNvbnN0IGVuZEluZGV4ID0gdXJsLmluZGV4T2YoJyYnLCB2YWx1ZUluZGV4KVxuICAgICAgICByZXR1cm4gX2RlY29kZVVSSSh1cmwuc2xpY2UodmFsdWVJbmRleCwgZW5kSW5kZXggPT09IC0xID8gdW5kZWZpbmVkIDogZW5kSW5kZXgpKVxuICAgICAgfSBlbHNlIGlmICh0cmFpbGluZ0tleUNvZGUgPT0gMzggfHwgaXNOYU4odHJhaWxpbmdLZXlDb2RlKSkge1xuICAgICAgICByZXR1cm4gJydcbiAgICAgIH1cbiAgICAgIGtleUluZGV4ID0gdXJsLmluZGV4T2YoYCYke2tleX1gLCBrZXlJbmRleClcbiAgICB9XG5cbiAgICBlbmNvZGVkID0gL1slK10vLnRlc3QodXJsKVxuICAgIGlmICghZW5jb2RlZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICAvLyBmYWxsYmFjayB0byBkZWZhdWx0IHJvdXRpbmVcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fVxuICBlbmNvZGVkID8/PSAvWyUrXS8udGVzdCh1cmwpXG5cbiAgbGV0IGtleUluZGV4ID0gdXJsLmluZGV4T2YoJz8nLCA4KVxuICB3aGlsZSAoa2V5SW5kZXggIT09IC0xKSB7XG4gICAgY29uc3QgbmV4dEtleUluZGV4ID0gdXJsLmluZGV4T2YoJyYnLCBrZXlJbmRleCArIDEpXG4gICAgbGV0IHZhbHVlSW5kZXggPSB1cmwuaW5kZXhPZignPScsIGtleUluZGV4KVxuICAgIGlmICh2YWx1ZUluZGV4ID4gbmV4dEtleUluZGV4ICYmIG5leHRLZXlJbmRleCAhPT0gLTEpIHtcbiAgICAgIHZhbHVlSW5kZXggPSAtMVxuICAgIH1cbiAgICBsZXQgbmFtZSA9IHVybC5zbGljZShcbiAgICAgIGtleUluZGV4ICsgMSxcbiAgICAgIHZhbHVlSW5kZXggPT09IC0xID8gKG5leHRLZXlJbmRleCA9PT0gLTEgPyB1bmRlZmluZWQgOiBuZXh0S2V5SW5kZXgpIDogdmFsdWVJbmRleFxuICAgIClcbiAgICBpZiAoZW5jb2RlZCkge1xuICAgICAgbmFtZSA9IF9kZWNvZGVVUkkobmFtZSlcbiAgICB9XG5cbiAgICBrZXlJbmRleCA9IG5leHRLZXlJbmRleFxuXG4gICAgaWYgKG5hbWUgPT09ICcnKSB7XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIGxldCB2YWx1ZVxuICAgIGlmICh2YWx1ZUluZGV4ID09PSAtMSkge1xuICAgICAgdmFsdWUgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSA9IHVybC5zbGljZSh2YWx1ZUluZGV4ICsgMSwgbmV4dEtleUluZGV4ID09PSAtMSA/IHVuZGVmaW5lZCA6IG5leHRLZXlJbmRleClcbiAgICAgIGlmIChlbmNvZGVkKSB7XG4gICAgICAgIHZhbHVlID0gX2RlY29kZVVSSSh2YWx1ZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgIDsoKHJlc3VsdHNbbmFtZV0gPz89IFtdKSBhcyBzdHJpbmdbXSkucHVzaCh2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0c1tuYW1lXSA/Pz0gdmFsdWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4ga2V5ID8gcmVzdWx0c1trZXldIDogcmVzdWx0c1xufVxuXG5leHBvcnQgY29uc3QgZ2V0UXVlcnlQYXJhbTogKFxuICB1cmw6IHN0cmluZyxcbiAga2V5Pzogc3RyaW5nXG4pID0+IHN0cmluZyB8IHVuZGVmaW5lZCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSBfZ2V0UXVlcnlQYXJhbSBhcyAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbikgPT4gc3RyaW5nIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuXG5leHBvcnQgY29uc3QgZ2V0UXVlcnlQYXJhbXMgPSAoXG4gIHVybDogc3RyaW5nLFxuICBrZXk/OiBzdHJpbmdcbik6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHwgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0+IHtcbiAgcmV0dXJuIF9nZXRRdWVyeVBhcmFtKHVybCwga2V5LCB0cnVlKSBhcyBzdHJpbmdbXSB8IHVuZGVmaW5lZCB8IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPlxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sTUFBTSxZQUFZLENBQUMsT0FBMkI7SUFDbkQsTUFBTSxRQUFRLEtBQUssS0FBSyxDQUFDO0lBQ3pCLElBQUksS0FBSyxDQUFDLEVBQUUsS0FBSyxJQUFJO1FBQ25CLE1BQU0sS0FBSztJQUNiLENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxtQkFBbUIsQ0FBQyxPQUEyQjtJ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