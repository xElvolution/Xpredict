import type { XPredictClientOptions } from './types.js';
type RequestOptions = {
    method?: 'GET' | 'POST' | 'PATCH';
    body?: unknown;
    auth?: boolean;
    idempotencyKey?: string;
};
export declare class HttpClient {
    private readonly baseUrl;
    private readonly apiKey?;
    private readonly timeout;
    private readonly retries;
    private readonly retryDelayMs;
    constructor(options?: XPredictClientOptions);
    getBaseUrl(): string;
    request<T>(path: string, opts?: RequestOptions): Promise<T>;
    private shouldRetry;
    private executeOnce;
}
export {};
//# sourceMappingURL=http.d.ts.map