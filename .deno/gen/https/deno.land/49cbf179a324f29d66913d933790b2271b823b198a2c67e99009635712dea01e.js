import { parseBody } from '../utils/body.ts';
export const validator = (target, validationFunc)=>{
    return async (c, next)=>{
        let value = {};
        switch(target){
            case 'json':
                try {
                    value = await c.req.raw.clone().json();
                } catch  {
                    console.error('Error: Malformed JSON in request body');
                    return c.json({
                        success: false,
                        message: 'Malformed JSON in request body'
                    }, 400);
                }
                break;
            case 'form':
                value = await parseBody(c.req.raw.clone());
                break;
            case 'query':
                value = Object.fromEntries(Object.entries(c.req.queries()).map(([k, v])=>{
                    return v.length === 1 ? [
                        k,
                        v[0]
                    ] : [
                        k,
                        v
                    ];
                }));
                break;
            case 'queries':
                value = c.req.queries();
                break;
            case 'param':
                value = c.req.param();
                break;
        }
        const res = validationFunc(value, c);
        if (res instanceof Response || res instanceof Promise) {
            return res;
        }
        c.req.addValidatedData(target, res);
        await next();
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvdmFsaWRhdG9yL3ZhbGlkYXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRleHQgfSBmcm9tICcuLi9jb250ZXh0LnRzJ1xuaW1wb3J0IHR5cGUgeyBFbnYsIFZhbGlkYXRpb25UYXJnZXRzLCBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uL3R5cGVzLnRzJ1xuaW1wb3J0IHsgcGFyc2VCb2R5IH0gZnJvbSAnLi4vdXRpbHMvYm9keS50cydcblxudHlwZSBWYWxpZGF0aW9uVGFyZ2V0S2V5c1dpdGhCb2R5ID0gJ2Zvcm0nIHwgJ2pzb24nXG50eXBlIFZhbGlkYXRpb25UYXJnZXRCeU1ldGhvZDxNPiA9IE0gZXh0ZW5kcyAnZ2V0JyB8ICdoZWFkJyAvLyBHRVQgYW5kIEhFQUQgcmVxdWVzdCBtdXN0IG5vdCBoYXZlIGEgYm9keSBjb250ZW50LlxuICA/IEV4Y2x1ZGU8a2V5b2YgVmFsaWRhdGlvblRhcmdldHMsIFZhbGlkYXRpb25UYXJnZXRLZXlzV2l0aEJvZHk+XG4gIDoga2V5b2YgVmFsaWRhdGlvblRhcmdldHNcblxuZXhwb3J0IHR5cGUgVmFsaWRhdGlvbkZ1bmN0aW9uPFxuICBJbnB1dFR5cGUsXG4gIE91dHB1dFR5cGUsXG4gIEUgZXh0ZW5kcyBFbnYgPSB7fSxcbiAgUCBleHRlbmRzIHN0cmluZyA9IHN0cmluZ1xuPiA9ICh2YWx1ZTogSW5wdXRUeXBlLCBjOiBDb250ZXh0PEUsIFA+KSA9PiBPdXRwdXRUeXBlIHwgUmVzcG9uc2UgfCBQcm9taXNlPFJlc3BvbnNlPlxuXG5leHBvcnQgY29uc3QgdmFsaWRhdG9yID0gPFxuICBJbnB1dFR5cGUsXG4gIFAgZXh0ZW5kcyBzdHJpbmcsXG4gIE0gZXh0ZW5kcyBzdHJpbmcsXG4gIFUgZXh0ZW5kcyBWYWxpZGF0aW9uVGFyZ2V0QnlNZXRob2Q8TT4sXG4gIE91dHB1dFR5cGUgPSBWYWxpZGF0aW9uVGFyZ2V0c1tVXSxcbiAgUDIgZXh0ZW5kcyBzdHJpbmcgPSBQLFxuICBWIGV4dGVuZHMge1xuICAgIGluOiB7IFtLIGluIFVdOiB1bmtub3duIGV4dGVuZHMgSW5wdXRUeXBlID8gT3V0cHV0VHlwZSA6IElucHV0VHlwZSB9XG4gICAgb3V0OiB7IFtLIGluIFVdOiBPdXRwdXRUeXBlIH1cbiAgfSA9IHtcbiAgICBpbjogeyBbSyBpbiBVXTogdW5rbm93biBleHRlbmRzIElucHV0VHlwZSA/IE91dHB1dFR5cGUgOiBJbnB1dFR5cGUgfVxuICAgIG91dDogeyBbSyBpbiBVXTogT3V0cHV0VHlwZSB9XG4gIH0sXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIEUgZXh0ZW5kcyBFbnYgPSBhbnlcbj4oXG4gIHRhcmdldDogVSxcbiAgdmFsaWRhdGlvbkZ1bmM6IFZhbGlkYXRpb25GdW5jdGlvbjxcbiAgICB1bmtub3duIGV4dGVuZHMgSW5wdXRUeXBlID8gVmFsaWRhdGlvblRhcmdldHNbVV0gOiBJbnB1dFR5cGUsXG4gICAgT3V0cHV0VHlwZSxcbiAgICBFLFxuICAgIFAyXG4gID5cbik6IE1pZGRsZXdhcmVIYW5kbGVyPEUsIFAsIFY+ID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgbGV0IHZhbHVlID0ge31cblxuICAgIHN3aXRjaCAodGFyZ2V0KSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YWx1ZSA9IGF3YWl0IGMucmVxLnJhdy5jbG9uZSgpLmpzb24oKVxuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjogTWFsZm9ybWVkIEpTT04gaW4gcmVxdWVzdCBib2R5JylcbiAgICAgICAgICByZXR1cm4gYy5qc29uKFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ01hbGZvcm1lZCBKU09OIGluIHJlcXVlc3QgYm9keScsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNDAwXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdmb3JtJzpcbiAgICAgICAgdmFsdWUgPSBhd2FpdCBwYXJzZUJvZHkoYy5yZXEucmF3LmNsb25lKCkpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdxdWVyeSc6XG4gICAgICAgIHZhbHVlID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgIE9iamVjdC5lbnRyaWVzKGMucmVxLnF1ZXJpZXMoKSkubWFwKChbaywgdl0pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB2Lmxlbmd0aCA9PT0gMSA/IFtrLCB2WzBdXSA6IFtrLCB2XVxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3F1ZXJpZXMnOlxuICAgICAgICB2YWx1ZSA9IGMucmVxLnF1ZXJpZXMoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncGFyYW0nOlxuICAgICAgICB2YWx1ZSA9IGMucmVxLnBhcmFtKCkgYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuICAgICAgICBicmVha1xuICAgIH1cblxuICAgIGNvbnN0IHJlcyA9IHZhbGlkYXRpb25GdW5jKHZhbHVlIGFzIG5ldmVyLCBjIGFzIG5ldmVyKVxuXG4gICAgaWYgKHJlcyBpbnN0YW5jZW9mIFJlc3BvbnNlIHx8IHJlcyBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgIHJldHVybiByZXNcbiAgICB9XG5cbiAgICBjLnJlcS5hZGRWYWxpZGF0ZWREYXRhKHRhcmdldCwgcmVzIGFzIG5ldmVyKVxuXG4gICAgYXdhaXQgbmV4dCgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFNBQVMsUUFBUSxtQkFBa0I7QUFjNUMsT0FBTyxNQUFNLFlBQVksQ0FpQnZCLFFBQ0EsaUJBTStCO0lBQy9CLE9BQU8sT0FBTyxHQUFHLE9BQVM7UUFDeEIsSUFBSSxRQUFRLENBQUM7UUFFYixPQUFRO1lBQ04sS0FBSztnQkFDSCxJQUFJO29CQUNGLFFBQVEsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUk7Z0JBQ3RDLEVBQUUsT0FBTTtvQkFDTixRQUFRLEtBQUssQ0FBQztvQkFDZCxPQUFPLEVBQUUsSUFBSSxDQUNYO3dCQUNFLFNBQVMsS0FBSzt3QkFDZCxTQUFTO29CQUNYLEdBQ0E7Z0JBRUo7Z0JBQ0EsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsUUFBUSxNQUFNLFVBQVUsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUs7Z0JBQ3ZDLEtBQUs7WUFDUCxLQUFLO2dCQUNILFFBQVEsT0FBTyxXQUFXLENBQ3hCLE9BQU8sT0FBTyxDQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFLO29CQUM5QyxPQUFPLEVBQUUsTUFBTSxLQUFLLElBQUk7d0JBQUM7d0JBQUcsQ0FBQyxDQUFDLEVBQUU7cUJBQUMsR0FBRzt3QkFBQzt3QkFBRztxQkFBRTtnQkFDNUM7Z0JBRUYsS0FBSztZQUNQLEtBQUs7Z0JBQ0gsUUFBUSxFQUFFLEdBQUcsQ0FBQyxPQUFPO2dCQUNyQixLQUFLO1lBQ1AsS0FBSztnQkFDSCxRQUFRLEVBQUUsR0FBRyxDQUFDLEtBQUs7Z0JBQ25CLEtBQUs7UUFDVDtRQUVBLE1BQU0sTUFBTSxlQUFlLE9BQWdCO1FBRTNDLElBQUksZUFBZSxZQUFZLGVBQWUsU0FBUztZQUNyRCxPQUFPO1FBQ1QsQ0FBQztRQUVELEVBQUUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFFBQVE7UUFFL0IsTUFBTTtJQUNSO0FBQ0YsRUFBQyJ9