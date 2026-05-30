export declare class XPredictError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(message: string, status: number, body?: unknown);
}
export declare class XPredictAuthError extends XPredictError {
    constructor(message?: string);
}
export declare class XPredictValidationError extends XPredictError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map