import { sha1 } from '../../utils/crypto.ts';
export const etag = (options = {
    weak: false
})=>{
    return async (c, next)=>{
        const ifNoneMatch = c.req.header('If-None-Match') || c.req.header('if-none-match');
        await next();
        const res = c.res;
        const clone = res.clone();
        const hash = await sha1(res.body || '');
        const etag = options.weak ? `W/"${hash}"` : `"${hash}"`;
        if (ifNoneMatch && ifNoneMatch === etag) {
            await clone.blob() // Force using body
            ;
            c.res = new Response(null, {
                status: 304,
                statusText: 'Not Modified',
                headers: {
                    ETag: etag
                }
            });
            c.res.headers.delete('Content-Length');
        } else {
            c.res = new Response(clone.body, clone);
            c.res.headers.append('ETag', etag);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvbWlkZGxld2FyZS9ldGFnL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcbmltcG9ydCB7IHNoYTEgfSBmcm9tICcuLi8uLi91dGlscy9jcnlwdG8udHMnXG5cbnR5cGUgRVRhZ09wdGlvbnMgPSB7XG4gIHdlYWs6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNvbnN0IGV0YWcgPSAob3B0aW9uczogRVRhZ09wdGlvbnMgPSB7IHdlYWs6IGZhbHNlIH0pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIHJldHVybiBhc3luYyAoYywgbmV4dCkgPT4ge1xuICAgIGNvbnN0IGlmTm9uZU1hdGNoID0gYy5yZXEuaGVhZGVyKCdJZi1Ob25lLU1hdGNoJykgfHwgYy5yZXEuaGVhZGVyKCdpZi1ub25lLW1hdGNoJylcblxuICAgIGF3YWl0IG5leHQoKVxuXG4gICAgY29uc3QgcmVzID0gYy5yZXMgYXMgUmVzcG9uc2VcbiAgICBjb25zdCBjbG9uZSA9IHJlcy5jbG9uZSgpXG4gICAgY29uc3QgaGFzaCA9IGF3YWl0IHNoYTEocmVzLmJvZHkgfHwgJycpXG5cbiAgICBjb25zdCBldGFnID0gb3B0aW9ucy53ZWFrID8gYFcvXCIke2hhc2h9XCJgIDogYFwiJHtoYXNofVwiYFxuXG4gICAgaWYgKGlmTm9uZU1hdGNoICYmIGlmTm9uZU1hdGNoID09PSBldGFnKSB7XG4gICAgICBhd2FpdCBjbG9uZS5ibG9iKCkgLy8gRm9yY2UgdXNpbmcgYm9keVxuICAgICAgYy5yZXMgPSBuZXcgUmVzcG9uc2UobnVsbCwge1xuICAgICAgICBzdGF0dXM6IDMwNCxcbiAgICAgICAgc3RhdHVzVGV4dDogJ05vdCBNb2RpZmllZCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBFVGFnOiBldGFnLFxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICAgIGMucmVzLmhlYWRlcnMuZGVsZXRlKCdDb250ZW50LUxlbmd0aCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIGMucmVzID0gbmV3IFJlc3BvbnNlKGNsb25lLmJvZHksIGNsb25lKVxuICAgICAgYy5yZXMuaGVhZGVycy5hcHBlbmQoJ0VUYWcnLCBldGFnKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQU01QyxPQUFPLE1BQU0sT0FBTyxDQUFDLFVBQXVCO0lBQUUsTUFBTSxLQUFLO0FBQUMsQ0FBQyxHQUF3QjtJQUNqRixPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU0sY0FBYyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUVsRSxNQUFNO1FBRU4sTUFBTSxNQUFNLEVBQUUsR0FBRztRQUNqQixNQUFNLFFBQVEsSUFBSSxLQUFLO1FBQ3ZCLE1BQU0sT0FBTyxNQUFNLEtBQUssSUFBSSxJQUFJLElBQUk7UUFFcEMsTUFBTSxPQUFPLFFBQVEsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdkQsSUFBSSxlQUFlLGdCQUFnQixNQUFNO1lBQ3ZDLE1BQU0sTUFBTSxJQUFJLEdBQUcsbUJBQW1COztZQUN0QyxFQUFFLEdBQUcsR0FBRyxJQUFJLFNBQVMsSUFBSSxFQUFFO2dCQUN6QixRQUFRO2dCQUNSLFlBQVk7Z0JBQ1osU0FBUztvQkFDUCxNQUFNO2dCQUNSO1lBQ0Y7WUFDQSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLE9BQU87WUFDTCxFQUFFLEdBQUcsR0FBRyxJQUFJLFNBQVMsTUFBTSxJQUFJLEVBQUU7WUFDakMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRO1FBQy9CLENBQUM7SUFDSDtBQUNGLEVBQUMifQ==