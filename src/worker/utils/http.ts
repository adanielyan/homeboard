import type { ApiError } from "../../shared/types";

export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}

export function errorResponse(status: number, code: string, message: string): Response {
  const body: ApiError = {
    error: code,
    message,
    status
  };

  return json(body, { status });
}

export function handleRouteError(error: unknown): Response {
  if (error instanceof HttpError) {
    return errorResponse(error.status, error.code, error.message);
  }

  console.error("Unhandled worker error", error);
  return errorResponse(500, "internal_error", "An unexpected error occurred.");
}
