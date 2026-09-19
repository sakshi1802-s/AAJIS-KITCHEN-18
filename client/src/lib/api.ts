/**
 * The one HTTP wrapper. Every server call in the client goes through here —
 * no raw fetch() in components. It always sends the session cookie, parses
 * the server's `{ error: { code, message, details } }` shape into ApiError,
 * and turns "server unreachable" into a friendly NETWORK error.
 */
import type { ApiErrorBody, ErrorCode } from "@shared/api";

export type ClientErrorCode = ErrorCode | "NETWORK";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ClientErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ClientErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Same-origin by default (Vite proxy in dev, Vercel rewrite in prod).
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = `${BASE_URL}/api${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorBody).error?.code === "string"
  );
}

async function request<T>(method: string, path: string, options: { body?: unknown; query?: Query } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), {
      method,
      credentials: "include",
      headers: options.body === undefined ? undefined : { "content-type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Can't reach the kitchen right now. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    if (isApiErrorBody(data)) {
      throw new ApiError(res.status, data.error.code, data.error.message, data.error.details);
    }
    throw new ApiError(res.status, "INTERNAL", "Something went wrong on our side. Please try again.");
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>("GET", path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, { body: body ?? {} }),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, { body }),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
