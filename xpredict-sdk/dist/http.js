import { XPredictError } from './errors.js';
import { DEFAULT_BASE_URL, SDK_VERSION, USER_AGENT } from './version.js';
export class HttpClient {
    baseUrl;
    apiKey;
    timeout;
    retries;
    retryDelayMs;
    constructor(options = {}) {
        this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
        this.apiKey = options.apiKey;
        this.timeout = options.timeout ?? 30_000;
        this.retries = options.retries ?? 2;
        this.retryDelayMs = options.retryDelayMs ?? 500;
    }
    getBaseUrl() {
        return this.baseUrl;
    }
    async request(path, opts = {}) {
        let lastError;
        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                return await this.executeOnce(path, opts);
            }
            catch (err) {
                lastError = err;
                if (!this.shouldRetry(err, attempt))
                    throw err;
                await sleep(this.retryDelayMs * (attempt + 1));
            }
        }
        throw lastError;
    }
    shouldRetry(err, attempt) {
        if (attempt >= this.retries)
            return false;
        if (!(err instanceof XPredictError))
            return false;
        return err.status >= 500 || err.status === 429 || err.status === 408;
    }
    async executeOnce(path, opts) {
        const headers = {
            Accept: 'application/json',
            'User-Agent': USER_AGENT,
            'X-SDK-Version': SDK_VERSION
        };
        if (opts.body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }
        if (opts.auth !== false && this.apiKey) {
            headers.Authorization = `Bearer ${this.apiKey}`;
        }
        if (opts.idempotencyKey) {
            headers['Idempotency-Key'] = opts.idempotencyKey;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);
        try {
            const res = await fetch(`${this.baseUrl}${path}`, {
                method: opts.method ?? 'GET',
                headers,
                body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
                signal: controller.signal
            });
            const text = await res.text();
            let parsed = null;
            if (text) {
                try {
                    parsed = JSON.parse(text);
                }
                catch {
                    throw new XPredictError('Invalid JSON response from API', res.status, text);
                }
            }
            if (parsed && typeof parsed === 'object' && 'ok' in parsed) {
                const envelope = parsed;
                if (!envelope.ok) {
                    throw new XPredictError(envelope.error.message, res.status, envelope);
                }
                if (!res.ok) {
                    throw new XPredictError(`HTTP ${res.status}`, res.status, envelope);
                }
                return envelope.data;
            }
            if (!res.ok) {
                const legacyMsg = parsed && typeof parsed === 'object' && parsed !== null && 'error' in parsed
                    ? String(parsed.error)
                    : `HTTP ${res.status}`;
                throw new XPredictError(legacyMsg, res.status, parsed);
            }
            return parsed;
        }
        catch (err) {
            if (err instanceof XPredictError)
                throw err;
            if (err instanceof Error && err.name === 'AbortError') {
                throw new XPredictError('Request timed out', 408);
            }
            throw err;
        }
        finally {
            clearTimeout(timer);
        }
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=http.js.map