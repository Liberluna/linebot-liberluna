import { HTTPException } from '../../http-exception.ts';
import { timingSafeEqual } from '../../utils/buffer.ts';
import { decodeBase64 } from '../../utils/encode.ts';
const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/;
const USER_PASS_REGEXP = /^([^:]*):(.*)$/;
const utf8Decoder = new TextDecoder();
const auth = (req)=>{
    const match = CREDENTIALS_REGEXP.exec(req.headers.get('Authorization') || '');
    if (!match) {
        return undefined;
    }
    const userPass = USER_PASS_REGEXP.exec(utf8Decoder.decode(decodeBase64(match[1])));
    if (!userPass) {
        return undefined;
    }
    return {
        username: userPass[1],
        password: userPass[2]
    };
};
export const basicAuth = (options, ...users)=>{
    if (!options) {
        throw new Error('basic auth middleware requires options for "username and password"');
    }
    if (!options.realm) {
        options.realm = 'Secure Area';
    }
    users.unshift({
        username: options.username,
        password: options.password
    });
    return async (ctx, next)=>{
        const requestUser = auth(ctx.req);
        if (requestUser) {
            for (const user of users){
                const usernameEqual = await timingSafeEqual(user.username, requestUser.username, options.hashFunction);
                const passwordEqual = await timingSafeEqual(user.password, requestUser.password, options.hashFunction);
                if (usernameEqual && passwordEqual) {
                    await next();
                    return;
                }
            }
        }
        const res = new Response('Unauthorized', {
            status: 401,
            headers: {
                'WWW-Authenticate': 'Basic realm="' + options.realm?.replace(/"/g, '\\"') + '"'
            }
        });
        throw new HTTPException(401, {
            res
        });
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvbWlkZGxld2FyZS9iYXNpYy1hdXRoL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEhUVFBFeGNlcHRpb24gfSBmcm9tICcuLi8uLi9odHRwLWV4Y2VwdGlvbi50cydcbmltcG9ydCB0eXBlIHsgSG9ub1JlcXVlc3QgfSBmcm9tICcuLi8uLi9yZXF1ZXN0LnRzJ1xuaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgdGltaW5nU2FmZUVxdWFsIH0gZnJvbSAnLi4vLi4vdXRpbHMvYnVmZmVyLnRzJ1xuaW1wb3J0IHsgZGVjb2RlQmFzZTY0IH0gZnJvbSAnLi4vLi4vdXRpbHMvZW5jb2RlLnRzJ1xuXG5jb25zdCBDUkVERU5USUFMU19SRUdFWFAgPSAvXiAqKD86W0JiXVtBYV1bU3NdW0lpXVtDY10pICsoW0EtWmEtejAtOS5ffisvLV0rPSopICokL1xuY29uc3QgVVNFUl9QQVNTX1JFR0VYUCA9IC9eKFteOl0qKTooLiopJC9cbmNvbnN0IHV0ZjhEZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKClcbmNvbnN0IGF1dGggPSAocmVxOiBIb25vUmVxdWVzdCkgPT4ge1xuICBjb25zdCBtYXRjaCA9IENSRURFTlRJQUxTX1JFR0VYUC5leGVjKHJlcS5oZWFkZXJzLmdldCgnQXV0aG9yaXphdGlvbicpIHx8ICcnKVxuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgY29uc3QgdXNlclBhc3MgPSBVU0VSX1BBU1NfUkVHRVhQLmV4ZWModXRmOERlY29kZXIuZGVjb2RlKGRlY29kZUJhc2U2NChtYXRjaFsxXSkpKVxuXG4gIGlmICghdXNlclBhc3MpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICByZXR1cm4geyB1c2VybmFtZTogdXNlclBhc3NbMV0sIHBhc3N3b3JkOiB1c2VyUGFzc1syXSB9XG59XG5cbmV4cG9ydCBjb25zdCBiYXNpY0F1dGggPSAoXG4gIG9wdGlvbnM6IHsgdXNlcm5hbWU6IHN0cmluZzsgcGFzc3dvcmQ6IHN0cmluZzsgcmVhbG0/OiBzdHJpbmc7IGhhc2hGdW5jdGlvbj86IEZ1bmN0aW9uIH0sXG4gIC4uLnVzZXJzOiB7IHVzZXJuYW1lOiBzdHJpbmc7IHBhc3N3b3JkOiBzdHJpbmcgfVtdXG4pOiBNaWRkbGV3YXJlSGFuZGxlciA9PiB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIHRocm93IG5ldyBFcnJvcignYmFzaWMgYXV0aCBtaWRkbGV3YXJlIHJlcXVpcmVzIG9wdGlvbnMgZm9yIFwidXNlcm5hbWUgYW5kIHBhc3N3b3JkXCInKVxuICB9XG5cbiAgaWYgKCFvcHRpb25zLnJlYWxtKSB7XG4gICAgb3B0aW9ucy5yZWFsbSA9ICdTZWN1cmUgQXJlYSdcbiAgfVxuICB1c2Vycy51bnNoaWZ0KHsgdXNlcm5hbWU6IG9wdGlvbnMudXNlcm5hbWUsIHBhc3N3b3JkOiBvcHRpb25zLnBhc3N3b3JkIH0pXG5cbiAgcmV0dXJuIGFzeW5jIChjdHgsIG5leHQpID0+IHtcbiAgICBjb25zdCByZXF1ZXN0VXNlciA9IGF1dGgoY3R4LnJlcSlcbiAgICBpZiAocmVxdWVzdFVzZXIpIHtcbiAgICAgIGZvciAoY29uc3QgdXNlciBvZiB1c2Vycykge1xuICAgICAgICBjb25zdCB1c2VybmFtZUVxdWFsID0gYXdhaXQgdGltaW5nU2FmZUVxdWFsKFxuICAgICAgICAgIHVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgcmVxdWVzdFVzZXIudXNlcm5hbWUsXG4gICAgICAgICAgb3B0aW9ucy5oYXNoRnVuY3Rpb25cbiAgICAgICAgKVxuICAgICAgICBjb25zdCBwYXNzd29yZEVxdWFsID0gYXdhaXQgdGltaW5nU2FmZUVxdWFsKFxuICAgICAgICAgIHVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgcmVxdWVzdFVzZXIucGFzc3dvcmQsXG4gICAgICAgICAgb3B0aW9ucy5oYXNoRnVuY3Rpb25cbiAgICAgICAgKVxuICAgICAgICBpZiAodXNlcm5hbWVFcXVhbCAmJiBwYXNzd29yZEVxdWFsKSB7XG4gICAgICAgICAgYXdhaXQgbmV4dCgpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzID0gbmV3IFJlc3BvbnNlKCdVbmF1dGhvcml6ZWQnLCB7XG4gICAgICBzdGF0dXM6IDQwMSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ1dXVy1BdXRoZW50aWNhdGUnOiAnQmFzaWMgcmVhbG09XCInICsgb3B0aW9ucy5yZWFsbT8ucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiJyxcbiAgICAgIH0sXG4gICAgfSlcbiAgICB0aHJvdyBuZXcgSFRUUEV4Y2VwdGlvbig0MDEsIHsgcmVzIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLGFBQWEsUUFBUSwwQkFBeUI7QUFHdkQsU0FBUyxlQUFlLFFBQVEsd0JBQXVCO0FBQ3ZELFNBQVMsWUFBWSxRQUFRLHdCQUF1QjtBQUVwRCxNQUFNLHFCQUFxQjtBQUMzQixNQUFNLG1CQUFtQjtBQUN6QixNQUFNLGNBQWMsSUFBSTtBQUN4QixNQUFNLE9BQU8sQ0FBQyxNQUFxQjtJQUNqQyxNQUFNLFFBQVEsbUJBQW1CLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO0lBQzFFLElBQUksQ0FBQyxPQUFPO1FBQ1YsT0FBTztJQUNULENBQUM7SUFFRCxNQUFNLFdBQVcsaUJBQWlCLElBQUksQ0FBQyxZQUFZLE1BQU0sQ0FBQyxhQUFhLEtBQUssQ0FBQyxFQUFFO0lBRS9FLElBQUksQ0FBQyxVQUFVO1FBQ2IsT0FBTztJQUNULENBQUM7SUFFRCxPQUFPO1FBQUUsVUFBVSxRQUFRLENBQUMsRUFBRTtRQUFFLFVBQVUsUUFBUSxDQUFDLEVBQUU7SUFBQztBQUN4RDtBQUVBLE9BQU8sTUFBTSxZQUFZLENBQ3ZCLFNBQ0EsR0FBRyxRQUNtQjtJQUN0QixJQUFJLENBQUMsU0FBUztRQUNaLE1BQU0sSUFBSSxNQUFNLHNFQUFxRTtJQUN2RixDQUFDO0lBRUQsSUFBSSxDQUFDLFFBQVEsS0FBSyxFQUFFO1FBQ2xCLFFBQVEsS0FBSyxHQUFHO0lBQ2xCLENBQUM7SUFDRCxNQUFNLE9BQU8sQ0FBQztRQUFFLFVBQVUsUUFBUSxRQUFRO1FBQUUsVUFBVSxRQUFRLFFBQVE7SUFBQztJQUV2RSxPQUFPLE9BQU8sS0FBSyxPQUFTO1FBQzFCLE1BQU0sY0FBYyxLQUFLLElBQUksR0FBRztRQUNoQyxJQUFJLGFBQWE7WUFDZixLQUFLLE1BQU0sUUFBUSxNQUFPO2dCQUN4QixNQUFNLGdCQUFnQixNQUFNLGdCQUMxQixLQUFLLFFBQVEsRUFDYixZQUFZLFFBQVEsRUFDcEIsUUFBUSxZQUFZO2dCQUV0QixNQUFNLGdCQUFnQixNQUFNLGdCQUMxQixLQUFLLFFBQVEsRUFDYixZQUFZLFFBQVEsRUFDcEIsUUFBUSxZQUFZO2dCQUV0QixJQUFJLGlCQUFpQixlQUFlO29CQUNsQyxNQUFNO29CQUNOO2dCQUNGLENBQUM7WUFDSDtRQUNGLENBQUM7UUFDRCxNQUFNLE1BQU0sSUFBSSxTQUFTLGdCQUFnQjtZQUN2QyxRQUFRO1lBQ1IsU0FBUztnQkFDUCxvQkFBb0Isa0JBQWtCLFFBQVEsS0FBSyxFQUFFLFFBQVEsTUFBTSxTQUFTO1lBQzlFO1FBQ0Y7UUFDQSxNQUFNLElBQUksY0FBYyxLQUFLO1lBQUU7UUFBSSxHQUFFO0lBQ3ZDO0FBQ0YsRUFBQyJ9