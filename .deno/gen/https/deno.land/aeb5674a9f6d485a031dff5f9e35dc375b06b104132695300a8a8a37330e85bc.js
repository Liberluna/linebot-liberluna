import { getStatusText } from './utils/http-status.ts';
export class HTTPException extends Error {
    res;
    status;
    constructor(status = 500, options){
        super(options?.message || getStatusText(status));
        this.res = options?.res;
        this.status = status;
    }
    getResponse() {
        if (this.res) {
            return this.res;
        }
        return new Response(this.message, {
            status: this.status,
            statusText: getStatusText(this.status)
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xLjYvaHR0cC1leGNlcHRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTdGF0dXNDb2RlIH0gZnJvbSAnLi91dGlscy9odHRwLXN0YXR1cy50cydcbmltcG9ydCB7IGdldFN0YXR1c1RleHQgfSBmcm9tICcuL3V0aWxzL2h0dHAtc3RhdHVzLnRzJ1xuXG50eXBlIEhUVFBFeGNlcHRpb25PcHRpb25zID0ge1xuICByZXM/OiBSZXNwb25zZVxuICBtZXNzYWdlPzogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBIVFRQRXhjZXB0aW9uIGV4dGVuZHMgRXJyb3Ige1xuICByZWFkb25seSByZXM/OiBSZXNwb25zZVxuICByZWFkb25seSBzdGF0dXM6IFN0YXR1c0NvZGVcbiAgY29uc3RydWN0b3Ioc3RhdHVzOiBTdGF0dXNDb2RlID0gNTAwLCBvcHRpb25zPzogSFRUUEV4Y2VwdGlvbk9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zPy5tZXNzYWdlIHx8IGdldFN0YXR1c1RleHQoc3RhdHVzKSlcbiAgICB0aGlzLnJlcyA9IG9wdGlvbnM/LnJlc1xuICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzXG4gIH1cbiAgZ2V0UmVzcG9uc2UoKTogUmVzcG9uc2Uge1xuICAgIGlmICh0aGlzLnJlcykge1xuICAgICAgcmV0dXJuIHRoaXMucmVzXG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5tZXNzYWdlLCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogZ2V0U3RhdHVzVGV4dCh0aGlzLnN0YXR1cyksXG4gICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsYUFBYSxRQUFRLHlCQUF3QjtBQU90RCxPQUFPLE1BQU0sc0JBQXNCO0lBQ3hCLElBQWM7SUFDZCxPQUFrQjtJQUMzQixZQUFZLFNBQXFCLEdBQUcsRUFBRSxPQUE4QixDQUFFO1FBQ3BFLEtBQUssQ0FBQyxTQUFTLFdBQVcsY0FBYztRQUN4QyxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRztJQUNoQjtJQUNBLGNBQXdCO1FBQ3RCLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUc7UUFDakIsQ0FBQztRQUNELE9BQU8sSUFBSSxTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEMsUUFBUSxJQUFJLENBQUMsTUFBTTtZQUNuQixZQUFZLGNBQWMsSUFBSSxDQUFDLE1BQU07UUFDdkM7SUFDRjtBQUNGLENBQUMifQ==