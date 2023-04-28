export const getMimeType = (filename)=>{
    const regexp = /\.([a-zA-Z0-9]+?)$/;
    const match = filename.match(regexp);
    if (!match) return;
    let mimeType = mimes[match[1]];
    if (mimeType && mimeType.startsWith('text') || mimeType === 'application/json') {
        mimeType += '; charset=utf-8';
    }
    return mimeType;
};
const mimes = {
    aac: 'audio/aac',
    abw: 'application/x-abiword',
    arc: 'application/x-freearc',
    avi: 'video/x-msvideo',
    avif: 'image/avif',
    av1: 'video/av1',
    azw: 'application/vnd.amazon.ebook',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    bz: 'application/x-bzip',
    bz2: 'application/x-bzip2',
    csh: 'application/x-csh',
    css: 'text/css',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    eot: 'application/vnd.ms-fontobject',
    epub: 'application/epub+zip',
    gif: 'image/gif',
    gz: 'application/gzip',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/x-icon',
    ics: 'text/calendar',
    jar: 'application/java-archive',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'text/javascript',
    json: 'application/json',
    jsonld: 'application/ld+json',
    map: 'application/json',
    mid: 'audio/x-midi',
    midi: 'audio/x-midi',
    mjs: 'text/javascript',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mpkg: 'application/vnd.apple.installer+xml',
    odp: 'application/vnd.oasis.opendocument.presentation',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    oga: 'audio/ogg',
    ogv: 'video/ogg',
    ogx: 'application/ogg',
    opus: 'audio/opus',
    otf: 'font/otf',
    pdf: 'application/pdf',
    php: 'application/php',
    png: 'image/png',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rtf: 'application/rtf',
    sh: 'application/x-sh',
    svg: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tar: 'application/x-tar',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ts: 'video/mp2t',
    ttf: 'font/ttf',
    txt: 'text/plain',
    vsd: 'application/vnd.visio',
    webm: 'video/webm',
    weba: 'audio/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml',
    xul: 'application/vnd.mozilla.xul+xml',
    zip: 'application/zip',
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    '7z': 'application/x-7z-compressed',
    gltf: 'model/gltf+json',
    glb: 'model/gltf-binary'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdXRpbHMvbWltZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgZ2V0TWltZVR5cGUgPSAoZmlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGNvbnN0IHJlZ2V4cCA9IC9cXC4oW2EtekEtWjAtOV0rPykkL1xuICBjb25zdCBtYXRjaCA9IGZpbGVuYW1lLm1hdGNoKHJlZ2V4cClcbiAgaWYgKCFtYXRjaCkgcmV0dXJuXG4gIGxldCBtaW1lVHlwZSA9IG1pbWVzW21hdGNoWzFdXVxuICBpZiAoKG1pbWVUeXBlICYmIG1pbWVUeXBlLnN0YXJ0c1dpdGgoJ3RleHQnKSkgfHwgbWltZVR5cGUgPT09ICdhcHBsaWNhdGlvbi9qc29uJykge1xuICAgIG1pbWVUeXBlICs9ICc7IGNoYXJzZXQ9dXRmLTgnXG4gIH1cbiAgcmV0dXJuIG1pbWVUeXBlXG59XG5cbmNvbnN0IG1pbWVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBhYWM6ICdhdWRpby9hYWMnLFxuICBhYnc6ICdhcHBsaWNhdGlvbi94LWFiaXdvcmQnLFxuICBhcmM6ICdhcHBsaWNhdGlvbi94LWZyZWVhcmMnLFxuICBhdmk6ICd2aWRlby94LW1zdmlkZW8nLFxuICBhdmlmOiAnaW1hZ2UvYXZpZicsXG4gIGF2MTogJ3ZpZGVvL2F2MScsXG4gIGF6dzogJ2FwcGxpY2F0aW9uL3ZuZC5hbWF6b24uZWJvb2snLFxuICBiaW46ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nLFxuICBibXA6ICdpbWFnZS9ibXAnLFxuICBiejogJ2FwcGxpY2F0aW9uL3gtYnppcCcsXG4gIGJ6MjogJ2FwcGxpY2F0aW9uL3gtYnppcDInLFxuICBjc2g6ICdhcHBsaWNhdGlvbi94LWNzaCcsXG4gIGNzczogJ3RleHQvY3NzJyxcbiAgY3N2OiAndGV4dC9jc3YnLFxuICBkb2M6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICBkb2N4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICBlb3Q6ICdhcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdCcsXG4gIGVwdWI6ICdhcHBsaWNhdGlvbi9lcHViK3ppcCcsXG4gIGdpZjogJ2ltYWdlL2dpZicsXG4gIGd6OiAnYXBwbGljYXRpb24vZ3ppcCcsXG4gIGh0bTogJ3RleHQvaHRtbCcsXG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBpY286ICdpbWFnZS94LWljb24nLFxuICBpY3M6ICd0ZXh0L2NhbGVuZGFyJyxcbiAgamFyOiAnYXBwbGljYXRpb24vamF2YS1hcmNoaXZlJyxcbiAganBlZzogJ2ltYWdlL2pwZWcnLFxuICBqcGc6ICdpbWFnZS9qcGVnJyxcbiAganM6ICd0ZXh0L2phdmFzY3JpcHQnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIGpzb25sZDogJ2FwcGxpY2F0aW9uL2xkK2pzb24nLFxuICBtYXA6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgbWlkOiAnYXVkaW8veC1taWRpJyxcbiAgbWlkaTogJ2F1ZGlvL3gtbWlkaScsXG4gIG1qczogJ3RleHQvamF2YXNjcmlwdCcsXG4gIG1wMzogJ2F1ZGlvL21wZWcnLFxuICBtcDQ6ICd2aWRlby9tcDQnLFxuICBtcGVnOiAndmlkZW8vbXBlZycsXG4gIG1wa2c6ICdhcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbCcsXG4gIG9kcDogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQucHJlc2VudGF0aW9uJyxcbiAgb2RzOiAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldCcsXG4gIG9kdDogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dCcsXG4gIG9nYTogJ2F1ZGlvL29nZycsXG4gIG9ndjogJ3ZpZGVvL29nZycsXG4gIG9neDogJ2FwcGxpY2F0aW9uL29nZycsXG4gIG9wdXM6ICdhdWRpby9vcHVzJyxcbiAgb3RmOiAnZm9udC9vdGYnLFxuICBwZGY6ICdhcHBsaWNhdGlvbi9wZGYnLFxuICBwaHA6ICdhcHBsaWNhdGlvbi9waHAnLFxuICBwbmc6ICdpbWFnZS9wbmcnLFxuICBwcHQ6ICdhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludCcsXG4gIHBwdHg6ICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uJyxcbiAgcnRmOiAnYXBwbGljYXRpb24vcnRmJyxcbiAgc2g6ICdhcHBsaWNhdGlvbi94LXNoJyxcbiAgc3ZnOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gIHN3ZjogJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyxcbiAgdGFyOiAnYXBwbGljYXRpb24veC10YXInLFxuICB0aWY6ICdpbWFnZS90aWZmJyxcbiAgdGlmZjogJ2ltYWdlL3RpZmYnLFxuICB0czogJ3ZpZGVvL21wMnQnLFxuICB0dGY6ICdmb250L3R0ZicsXG4gIHR4dDogJ3RleHQvcGxhaW4nLFxuICB2c2Q6ICdhcHBsaWNhdGlvbi92bmQudmlzaW8nLFxuICB3ZWJtOiAndmlkZW8vd2VibScsXG4gIHdlYmE6ICdhdWRpby93ZWJtJyxcbiAgd2VicDogJ2ltYWdlL3dlYnAnLFxuICB3b2ZmOiAnZm9udC93b2ZmJyxcbiAgd29mZjI6ICdmb250L3dvZmYyJyxcbiAgeGh0bWw6ICdhcHBsaWNhdGlvbi94aHRtbCt4bWwnLFxuICB4bHM6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bHN4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB4dWw6ICdhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sJyxcbiAgemlwOiAnYXBwbGljYXRpb24vemlwJyxcbiAgJzNncCc6ICd2aWRlby8zZ3BwJyxcbiAgJzNnMic6ICd2aWRlby8zZ3BwMicsXG4gICc3eic6ICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnLFxuICBnbHRmOiAnbW9kZWwvZ2x0Zitqc29uJyxcbiAgZ2xiOiAnbW9kZWwvZ2x0Zi1iaW5hcnknLFxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxjQUFjLENBQUMsV0FBeUM7SUFDbkUsTUFBTSxTQUFTO0lBQ2YsTUFBTSxRQUFRLFNBQVMsS0FBSyxDQUFDO0lBQzdCLElBQUksQ0FBQyxPQUFPO0lBQ1osSUFBSSxXQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0lBQzlCLElBQUksQUFBQyxZQUFZLFNBQVMsVUFBVSxDQUFDLFdBQVksYUFBYSxvQkFBb0I7UUFDaEYsWUFBWTtJQUNkLENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQztBQUVELE1BQU0sUUFBZ0M7SUFDcEMsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsSUFBSTtJQUNKLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLElBQUk7SUFDSixLQUFLO0lBQ0wsTUFBTTtJQUNOLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLE1BQU07SUFDTixLQUFLO0lBQ0wsSUFBSTtJQUNKLE1BQU07SUFDTixRQUFRO0lBQ1IsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLElBQUk7SUFDSixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLElBQUk7SUFDSixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sT0FBTztJQUNQLE9BQU87SUFDUCxLQUFLO0lBQ0wsTUFBTTtJQUNOLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLE9BQU87SUFDUCxPQUFPO0lBQ1AsTUFBTTtJQUNOLE1BQU07SUFDTixLQUFLO0FBQ1AifQ==