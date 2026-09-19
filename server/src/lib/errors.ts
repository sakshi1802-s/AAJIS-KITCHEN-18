import type { ErrorCode } from "@shared/api";

/**
 * Handlers and services `throw` one of these; the central errorHandler turns
 * it into `{ error: { code, message, details? } }` with the right status.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const BadRequest = (message: string, details?: unknown) =>
  new AppError(400, "VALIDATION_ERROR", message, details);

export const Unauthenticated = (message = "Please sign in to continue.") =>
  new AppError(401, "UNAUTHENTICATED", message);

export const Forbidden = (message = "You don't have access to this.") =>
  new AppError(403, "FORBIDDEN", message);

export const NotFound = (what = "Resource") => new AppError(404, "NOT_FOUND", `${what} not found.`);

export const InvalidTransition = (message: string) => new AppError(409, "INVALID_TRANSITION", message);
