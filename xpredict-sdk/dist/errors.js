export class XPredictError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.name = 'XPredictError';
        this.status = status;
        this.body = body;
    }
}
export class XPredictAuthError extends XPredictError {
    constructor(message = 'Invalid or missing API key') {
        super(message, 401);
        this.name = 'XPredictAuthError';
    }
}
export class XPredictValidationError extends XPredictError {
    constructor(message) {
        super(message, 400);
        this.name = 'XPredictValidationError';
    }
}
//# sourceMappingURL=errors.js.map