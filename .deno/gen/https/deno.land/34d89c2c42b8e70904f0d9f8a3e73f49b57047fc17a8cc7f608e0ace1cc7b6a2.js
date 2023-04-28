// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
export class RetryError extends Error {
    constructor(cause, count){
        super(`Exceeded max retry count (${count})`);
        this.name = "RetryError";
        this.cause = cause;
    }
}
const defaultRetryOptions = {
    multiplier: 2,
    maxTimeout: 60000,
    maxAttempts: 5,
    minTimeout: 1000
};
/**
 * Creates a retry promise which resolves to the value of the input using exponential backoff.
 * If the input promise throws, it will be retried `maxAttempts` number of times.
 * It will retry the input every certain amount of milliseconds, starting at `minTimeout` and multiplying by the `multiplier` until it reaches the `maxTimeout`
 *
 * @example
 * ```typescript
 * import { retry } from "https://deno.land/std@$STD_VERSION/async/mod.ts";
 * const req = async () => {
 *  // some function that throws sometimes
 * };
 *
 * // Below resolves to the first non-error result of `req`
 * const retryPromise = await retry(req, {
 *  multiplier: 2,
 *  maxTimeout: 60000,
 *  maxAttempts: 5,
 *  minTimeout: 100,
 * });
```
 */ export async function retry(fn, opts) {
    const options = {
        ...defaultRetryOptions,
        ...opts
    };
    if (options.maxTimeout >= 0 && options.minTimeout > options.maxTimeout) {
        throw new RangeError("minTimeout is greater than maxTimeout");
    }
    let timeout = options.minTimeout;
    let error;
    for(let i = 0; i < options.maxAttempts; i++){
        try {
            return await fn();
        } catch (err) {
            await new Promise((r)=>setTimeout(r, timeout));
            timeout *= options.multiplier;
            timeout = Math.max(timeout, options.minTimeout);
            if (options.maxTimeout >= 0) {
                timeout = Math.min(timeout, options.maxTimeout);
            }
            error = err;
        }
    }
    throw new RetryError(error, options.maxAttempts);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE4NC4wL2FzeW5jL3JldHJ5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmV4cG9ydCBjbGFzcyBSZXRyeUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjYXVzZTogdW5rbm93biwgY291bnQ6IG51bWJlcikge1xuICAgIHN1cGVyKGBFeGNlZWRlZCBtYXggcmV0cnkgY291bnQgKCR7Y291bnR9KWApO1xuICAgIHRoaXMubmFtZSA9IFwiUmV0cnlFcnJvclwiO1xuICAgIHRoaXMuY2F1c2UgPSBjYXVzZTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5T3B0aW9ucyB7XG4gIC8qKiBIb3cgbXVjaCB0byBiYWNrb2ZmIGFmdGVyIGVhY2ggcmV0cnkuIFRoaXMgaXMgYDJgIGJ5IGRlZmF1bHQuICovXG4gIG11bHRpcGxpZXI/OiBudW1iZXI7XG4gIC8qKiBUaGUgbWF4aW11bSBtaWxsaXNlY29uZHMgYmV0d2VlbiByZXRyaWVzLiBUaGlzIGlzIGA2MDAwMGAgYnkgZGVmYXVsdC4gKi9cbiAgbWF4VGltZW91dD86IG51bWJlcjtcbiAgLyoqIFRoZSBtYXhpbXVtIGFtb3VudCBvZiByZXRyaWVzIHVudGlsIGZhaWx1cmUuIFRoaXMgaXMgYDVgIGJ5IGRlZmF1bHQuICovXG4gIG1heEF0dGVtcHRzPzogbnVtYmVyO1xuICAvKiogVGhlIGluaXRhbCBhbmQgbWluaW11bSBhbW91bnQgb2YgbWlsbGlzZWNvbmRzIGJldHdlZW4gcmV0cmllcy4gVGhpcyBpcyBgMTAwMGAgYnkgZGVmYXVsdC4gKi9cbiAgbWluVGltZW91dD86IG51bWJlcjtcbn1cblxuY29uc3QgZGVmYXVsdFJldHJ5T3B0aW9ucyA9IHtcbiAgbXVsdGlwbGllcjogMixcbiAgbWF4VGltZW91dDogNjAwMDAsXG4gIG1heEF0dGVtcHRzOiA1LFxuICBtaW5UaW1lb3V0OiAxMDAwLFxufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgcmV0cnkgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IHVzaW5nIGV4cG9uZW50aWFsIGJhY2tvZmYuXG4gKiBJZiB0aGUgaW5wdXQgcHJvbWlzZSB0aHJvd3MsIGl0IHdpbGwgYmUgcmV0cmllZCBgbWF4QXR0ZW1wdHNgIG51bWJlciBvZiB0aW1lcy5cbiAqIEl0IHdpbGwgcmV0cnkgdGhlIGlucHV0IGV2ZXJ5IGNlcnRhaW4gYW1vdW50IG9mIG1pbGxpc2Vjb25kcywgc3RhcnRpbmcgYXQgYG1pblRpbWVvdXRgIGFuZCBtdWx0aXBseWluZyBieSB0aGUgYG11bHRpcGxpZXJgIHVudGlsIGl0IHJlYWNoZXMgdGhlIGBtYXhUaW1lb3V0YFxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQgeyByZXRyeSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2FzeW5jL21vZC50c1wiO1xuICogY29uc3QgcmVxID0gYXN5bmMgKCkgPT4ge1xuICogIC8vIHNvbWUgZnVuY3Rpb24gdGhhdCB0aHJvd3Mgc29tZXRpbWVzXG4gKiB9O1xuICpcbiAqIC8vIEJlbG93IHJlc29sdmVzIHRvIHRoZSBmaXJzdCBub24tZXJyb3IgcmVzdWx0IG9mIGByZXFgXG4gKiBjb25zdCByZXRyeVByb21pc2UgPSBhd2FpdCByZXRyeShyZXEsIHtcbiAqICBtdWx0aXBsaWVyOiAyLFxuICogIG1heFRpbWVvdXQ6IDYwMDAwLFxuICogIG1heEF0dGVtcHRzOiA1LFxuICogIG1pblRpbWVvdXQ6IDEwMCxcbiAqIH0pO1xuYGBgXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXRyeTxUPihcbiAgZm46ICgoKSA9PiBQcm9taXNlPFQ+KSB8ICgoKSA9PiBUKSxcbiAgb3B0cz86IFJldHJ5T3B0aW9ucyxcbikge1xuICBjb25zdCBvcHRpb25zOiBSZXF1aXJlZDxSZXRyeU9wdGlvbnM+ID0ge1xuICAgIC4uLmRlZmF1bHRSZXRyeU9wdGlvbnMsXG4gICAgLi4ub3B0cyxcbiAgfTtcblxuICBpZiAob3B0aW9ucy5tYXhUaW1lb3V0ID49IDAgJiYgb3B0aW9ucy5taW5UaW1lb3V0ID4gb3B0aW9ucy5tYXhUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJtaW5UaW1lb3V0IGlzIGdyZWF0ZXIgdGhhbiBtYXhUaW1lb3V0XCIpO1xuICB9XG5cbiAgbGV0IHRpbWVvdXQgPSBvcHRpb25zLm1pblRpbWVvdXQ7XG4gIGxldCBlcnJvcjogdW5rbm93bjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IG9wdGlvbnMubWF4QXR0ZW1wdHM7IGkrKykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgZm4oKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIHRpbWVvdXQpKTtcbiAgICAgIHRpbWVvdXQgKj0gb3B0aW9ucy5tdWx0aXBsaWVyO1xuICAgICAgdGltZW91dCA9IE1hdGgubWF4KHRpbWVvdXQsIG9wdGlvbnMubWluVGltZW91dCk7XG4gICAgICBpZiAob3B0aW9ucy5tYXhUaW1lb3V0ID49IDApIHtcbiAgICAgICAgdGltZW91dCA9IE1hdGgubWluKHRpbWVvdXQsIG9wdGlvbnMubWF4VGltZW91dCk7XG4gICAgICB9XG4gICAgICBlcnJvciA9IGVycjtcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgUmV0cnlFcnJvcihlcnJvciwgb3B0aW9ucy5tYXhBdHRlbXB0cyk7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxPQUFPLE1BQU0sbUJBQW1CO0lBQzlCLFlBQVksS0FBYyxFQUFFLEtBQWEsQ0FBRTtRQUN6QyxLQUFLLENBQUMsQ0FBQywwQkFBMEIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRztJQUNmO0FBQ0YsQ0FBQztBQWFELE1BQU0sc0JBQXNCO0lBQzFCLFlBQVk7SUFDWixZQUFZO0lBQ1osYUFBYTtJQUNiLFlBQVk7QUFDZDtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW9CQyxHQUNELE9BQU8sZUFBZSxNQUNwQixFQUFrQyxFQUNsQyxJQUFtQixFQUNuQjtJQUNBLE1BQU0sVUFBa0M7UUFDdEMsR0FBRyxtQkFBbUI7UUFDdEIsR0FBRyxJQUFJO0lBQ1Q7SUFFQSxJQUFJLFFBQVEsVUFBVSxJQUFJLEtBQUssUUFBUSxVQUFVLEdBQUcsUUFBUSxVQUFVLEVBQUU7UUFDdEUsTUFBTSxJQUFJLFdBQVcseUNBQXlDO0lBQ2hFLENBQUM7SUFFRCxJQUFJLFVBQVUsUUFBUSxVQUFVO0lBQ2hDLElBQUk7SUFFSixJQUFLLElBQUksSUFBSSxHQUFHLElBQUksUUFBUSxXQUFXLEVBQUUsSUFBSztRQUM1QyxJQUFJO1lBQ0YsT0FBTyxNQUFNO1FBQ2YsRUFBRSxPQUFPLEtBQUs7WUFDWixNQUFNLElBQUksUUFBUSxDQUFDLElBQU0sV0FBVyxHQUFHO1lBQ3ZDLFdBQVcsUUFBUSxVQUFVO1lBQzdCLFVBQVUsS0FBSyxHQUFHLENBQUMsU0FBUyxRQUFRLFVBQVU7WUFDOUMsSUFBSSxRQUFRLFVBQVUsSUFBSSxHQUFHO2dCQUMzQixVQUFVLEtBQUssR0FBRyxDQUFDLFNBQVMsUUFBUSxVQUFVO1lBQ2hELENBQUM7WUFDRCxRQUFRO1FBQ1Y7SUFDRjtJQUVBLE1BQU0sSUFBSSxXQUFXLE9BQU8sUUFBUSxXQUFXLEVBQUU7QUFDbkQsQ0FBQyJ9