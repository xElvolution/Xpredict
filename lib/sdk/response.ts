import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type ApiMeta = {
  apiVersion: 'v1';
  requestId: string;
  timestamp: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: ApiMeta;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
  meta: ApiMeta;
};

export function apiMeta(requestId?: string): ApiMeta {
  return {
    apiVersion: 'v1',
    requestId: requestId ?? randomUUID(),
    timestamp: new Date().toISOString()
  };
}

export function apiOk<T>(data: T, status = 200, requestId?: string) {
  const body: ApiSuccess<T> = { ok: true, data, meta: apiMeta(requestId) };
  return NextResponse.json(body, {
    status,
    headers: {
      'X-API-Version': 'v1',
      'X-Request-Id': body.meta.requestId
    }
  });
}

export function apiErr(code: ApiErrorCode, message: string, status: number, requestId?: string) {
  const body: ApiFailure = {
    ok: false,
    error: { code, message },
    meta: apiMeta(requestId)
  };
  return NextResponse.json(body, {
    status,
    headers: {
      'X-API-Version': 'v1',
      'X-Request-Id': body.meta.requestId
    }
  });
}
