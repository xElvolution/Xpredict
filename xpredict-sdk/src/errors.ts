export class XPredictError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body?: unknown) {
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
  constructor(message: string) {
    super(message, 400);
    this.name = 'XPredictValidationError';
  }
}
