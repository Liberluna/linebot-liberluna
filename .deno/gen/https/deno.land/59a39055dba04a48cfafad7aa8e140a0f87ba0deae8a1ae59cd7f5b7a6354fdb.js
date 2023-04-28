export const cors = (options)=>{
    const defaults = {
        origin: '*',
        allowMethods: [
            'GET',
            'HEAD',
            'PUT',
            'POST',
            'DELETE',
            'PATCH'
        ],
        allowHeaders: [],
        exposeHeaders: []
    };
    const opts = {
        ...defaults,
        ...options
    };
    const findAllowOrigin = ((optsOrigin)=>{
        if (typeof optsOrigin === 'string') {
            return ()=>optsOrigin;
        } else if (typeof optsOrigin === 'function') {
            return optsOrigin;
        } else {
            return (origin)=>optsOrigin.includes(origin) ? origin : optsOrigin[0];
        }
    })(opts.origin);
    return async (c, next)=>{
        function set(key, value) {
            c.res.headers.append(key, value);
        }
        const allowOrigin = findAllowOrigin(c.req.headers.get('origin') || '');
        if (allowOrigin) {
            set('Access-Control-Allow-Origin', allowOrigin);
        }
        // Suppose the server sends a response with an Access-Control-Allow-Origin value with an explicit origin (rather than the "*" wildcard).
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
        if (opts.origin !== '*') {
            set('Vary', 'Origin');
        }
        if (opts.credentials) {
            set('Access-Control-Allow-Credentials', 'true');
        }
        if (opts.exposeHeaders?.length) {
            set('Access-Control-Expose-Headers', opts.exposeHeaders.join(','));
        }
        if (c.req.method !== 'OPTIONS') {
            await next();
        } else {
            // Preflight
            if (opts.maxAge != null) {
                set('Access-Control-Max-Age', opts.maxAge.toString());
            }
            if (opts.allowMethods?.length) {
                set('Access-Control-Allow-Methods', opts.allowMethods.join(','));
            }
            let headers = opts.allowHeaders;
            if (!headers?.length) {
                const requestHeaders = c.req.headers.get('Access-Control-Request-Headers');
                if (requestHeaders) {
                    headers = requestHeaders.split(/\s*,\s*/);
                }
            }
            if (headers?.length) {
                set('Access-Control-Allow-Headers', headers.join(','));
                set('Vary', 'Access-Control-Request-Headers');
            }
            c.res.headers.delete('Content-Length');
            c.res.headers.delete('Content-Type');
            return new Response(null, {
                headers: c.res.headers,
                status: 204,
                statusText: c.res.statusText
            });
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvbWlkZGxld2FyZS9jb3JzL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgTWlkZGxld2FyZUhhbmRsZXIgfSBmcm9tICcuLi8uLi90eXBlcy50cydcblxudHlwZSBDT1JTT3B0aW9ucyA9IHtcbiAgb3JpZ2luOiBzdHJpbmcgfCBzdHJpbmdbXSB8ICgob3JpZ2luOiBzdHJpbmcpID0+IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwpXG4gIGFsbG93TWV0aG9kcz86IHN0cmluZ1tdXG4gIGFsbG93SGVhZGVycz86IHN0cmluZ1tdXG4gIG1heEFnZT86IG51bWJlclxuICBjcmVkZW50aWFscz86IGJvb2xlYW5cbiAgZXhwb3NlSGVhZGVycz86IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBjb25zdCBjb3JzID0gKG9wdGlvbnM/OiBDT1JTT3B0aW9ucyk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgY29uc3QgZGVmYXVsdHM6IENPUlNPcHRpb25zID0ge1xuICAgIG9yaWdpbjogJyonLFxuICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnSEVBRCcsICdQVVQnLCAnUE9TVCcsICdERUxFVEUnLCAnUEFUQ0gnXSxcbiAgICBhbGxvd0hlYWRlcnM6IFtdLFxuICAgIGV4cG9zZUhlYWRlcnM6IFtdLFxuICB9XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgLi4uZGVmYXVsdHMsXG4gICAgLi4ub3B0aW9ucyxcbiAgfVxuXG4gIGNvbnN0IGZpbmRBbGxvd09yaWdpbiA9ICgob3B0c09yaWdpbikgPT4ge1xuICAgIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiAoKSA9PiBvcHRzT3JpZ2luXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0c09yaWdpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9wdHNPcmlnaW5cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIChvcmlnaW46IHN0cmluZykgPT4gKG9wdHNPcmlnaW4uaW5jbHVkZXMob3JpZ2luKSA/IG9yaWdpbiA6IG9wdHNPcmlnaW5bMF0pXG4gICAgfVxuICB9KShvcHRzLm9yaWdpbilcblxuICByZXR1cm4gYXN5bmMgKGMsIG5leHQpID0+IHtcbiAgICBmdW5jdGlvbiBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICAgIGMucmVzLmhlYWRlcnMuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfVxuXG4gICAgY29uc3QgYWxsb3dPcmlnaW4gPSBmaW5kQWxsb3dPcmlnaW4oYy5yZXEuaGVhZGVycy5nZXQoJ29yaWdpbicpIHx8ICcnKVxuICAgIGlmIChhbGxvd09yaWdpbikge1xuICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCBhbGxvd09yaWdpbilcbiAgICB9XG5cbiAgICAvLyBTdXBwb3NlIHRoZSBzZXJ2ZXIgc2VuZHMgYSByZXNwb25zZSB3aXRoIGFuIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiB2YWx1ZSB3aXRoIGFuIGV4cGxpY2l0IG9yaWdpbiAocmF0aGVyIHRoYW4gdGhlIFwiKlwiIHdpbGRjYXJkKS5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9IVFRQL0hlYWRlcnMvQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXG4gICAgaWYgKG9wdHMub3JpZ2luICE9PSAnKicpIHtcbiAgICAgIHNldCgnVmFyeScsICdPcmlnaW4nKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmNyZWRlbnRpYWxzKSB7XG4gICAgICBzZXQoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmV4cG9zZUhlYWRlcnM/Lmxlbmd0aCkge1xuICAgICAgc2V0KCdBY2Nlc3MtQ29udHJvbC1FeHBvc2UtSGVhZGVycycsIG9wdHMuZXhwb3NlSGVhZGVycy5qb2luKCcsJykpXG4gICAgfVxuXG4gICAgaWYgKGMucmVxLm1ldGhvZCAhPT0gJ09QVElPTlMnKSB7XG4gICAgICBhd2FpdCBuZXh0KClcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUHJlZmxpZ2h0XG5cbiAgICAgIGlmIChvcHRzLm1heEFnZSAhPSBudWxsKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtTWF4LUFnZScsIG9wdHMubWF4QWdlLnRvU3RyaW5nKCkpXG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRzLmFsbG93TWV0aG9kcz8ubGVuZ3RoKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcycsIG9wdHMuYWxsb3dNZXRob2RzLmpvaW4oJywnKSlcbiAgICAgIH1cblxuICAgICAgbGV0IGhlYWRlcnMgPSBvcHRzLmFsbG93SGVhZGVyc1xuICAgICAgaWYgKCFoZWFkZXJzPy5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdEhlYWRlcnMgPSBjLnJlcS5oZWFkZXJzLmdldCgnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1IZWFkZXJzJylcbiAgICAgICAgaWYgKHJlcXVlc3RIZWFkZXJzKSB7XG4gICAgICAgICAgaGVhZGVycyA9IHJlcXVlc3RIZWFkZXJzLnNwbGl0KC9cXHMqLFxccyovKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaGVhZGVycz8ubGVuZ3RoKSB7XG4gICAgICAgIHNldCgnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycycsIGhlYWRlcnMuam9pbignLCcpKVxuICAgICAgICBzZXQoJ1ZhcnknLCAnQWNjZXNzLUNvbnRyb2wtUmVxdWVzdC1IZWFkZXJzJylcbiAgICAgIH1cblxuICAgICAgYy5yZXMuaGVhZGVycy5kZWxldGUoJ0NvbnRlbnQtTGVuZ3RoJylcbiAgICAgIGMucmVzLmhlYWRlcnMuZGVsZXRlKCdDb250ZW50LVR5cGUnKVxuXG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtcbiAgICAgICAgaGVhZGVyczogYy5yZXMuaGVhZGVycyxcbiAgICAgICAgc3RhdHVzOiAyMDQsXG4gICAgICAgIHN0YXR1c1RleHQ6IGMucmVzLnN0YXR1c1RleHQsXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVdBLE9BQU8sTUFBTSxPQUFPLENBQUMsVUFBNkM7SUFDaEUsTUFBTSxXQUF3QjtRQUM1QixRQUFRO1FBQ1IsY0FBYztZQUFDO1lBQU87WUFBUTtZQUFPO1lBQVE7WUFBVTtTQUFRO1FBQy9ELGNBQWMsRUFBRTtRQUNoQixlQUFlLEVBQUU7SUFDbkI7SUFDQSxNQUFNLE9BQU87UUFDWCxHQUFHLFFBQVE7UUFDWCxHQUFHLE9BQU87SUFDWjtJQUVBLE1BQU0sa0JBQWtCLENBQUMsQ0FBQyxhQUFlO1FBQ3ZDLElBQUksT0FBTyxlQUFlLFVBQVU7WUFDbEMsT0FBTyxJQUFNO1FBQ2YsT0FBTyxJQUFJLE9BQU8sZUFBZSxZQUFZO1lBQzNDLE9BQU87UUFDVCxPQUFPO1lBQ0wsT0FBTyxDQUFDLFNBQW9CLFdBQVcsUUFBUSxDQUFDLFVBQVUsU0FBUyxVQUFVLENBQUMsRUFBRTtRQUNsRixDQUFDO0lBQ0gsQ0FBQyxFQUFFLEtBQUssTUFBTTtJQUVkLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsU0FBUyxJQUFJLEdBQVcsRUFBRSxLQUFhLEVBQUU7WUFDdkMsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1FBQzVCO1FBRUEsTUFBTSxjQUFjLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWE7UUFDbkUsSUFBSSxhQUFhO1lBQ2YsSUFBSSwrQkFBK0I7UUFDckMsQ0FBQztRQUVELHdJQUF3STtRQUN4SSx3RkFBd0Y7UUFDeEYsSUFBSSxLQUFLLE1BQU0sS0FBSyxLQUFLO1lBQ3ZCLElBQUksUUFBUTtRQUNkLENBQUM7UUFFRCxJQUFJLEtBQUssV0FBVyxFQUFFO1lBQ3BCLElBQUksb0NBQW9DO1FBQzFDLENBQUM7UUFFRCxJQUFJLEtBQUssYUFBYSxFQUFFLFFBQVE7WUFDOUIsSUFBSSxpQ0FBaUMsS0FBSyxhQUFhLENBQUMsSUFBSSxDQUFDO1FBQy9ELENBQUM7UUFFRCxJQUFJLEVBQUUsR0FBRyxDQUFDLE1BQU0sS0FBSyxXQUFXO1lBQzlCLE1BQU07UUFDUixPQUFPO1lBQ0wsWUFBWTtZQUVaLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxFQUFFO2dCQUN2QixJQUFJLDBCQUEwQixLQUFLLE1BQU0sQ0FBQyxRQUFRO1lBQ3BELENBQUM7WUFFRCxJQUFJLEtBQUssWUFBWSxFQUFFLFFBQVE7Z0JBQzdCLElBQUksZ0NBQWdDLEtBQUssWUFBWSxDQUFDLElBQUksQ0FBQztZQUM3RCxDQUFDO1lBRUQsSUFBSSxVQUFVLEtBQUssWUFBWTtZQUMvQixJQUFJLENBQUMsU0FBUyxRQUFRO2dCQUNwQixNQUFNLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUN6QyxJQUFJLGdCQUFnQjtvQkFDbEIsVUFBVSxlQUFlLEtBQUssQ0FBQztnQkFDakMsQ0FBQztZQUNILENBQUM7WUFDRCxJQUFJLFNBQVMsUUFBUTtnQkFDbkIsSUFBSSxnQ0FBZ0MsUUFBUSxJQUFJLENBQUM7Z0JBQ2pELElBQUksUUFBUTtZQUNkLENBQUM7WUFFRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ3JCLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFFckIsT0FBTyxJQUFJLFNBQVMsSUFBSSxFQUFFO2dCQUN4QixTQUFTLEVBQUUsR0FBRyxDQUFDLE9BQU87Z0JBQ3RCLFFBQVE7Z0JBQ1IsWUFBWSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1lBQzlCO1FBQ0YsQ0FBQztJQUNIO0FBQ0YsRUFBQyJ9