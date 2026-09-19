import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import type { ApiErrorBody } from "@shared/api";
import { AppError, NotFound } from "../lib/errors";
import { logger } from "../lib/logger";

/** Any /api route nobody matched. */
export const notFoundHandler: RequestHandler = (req) => {
  throw NotFound(`Route ${req.method} ${req.baseUrl}${req.path}`);
};

/**
 * The single place an error becomes an HTTP response. Handlers and services
 * throw; Express 5 forwards rejected promises here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let status = 500;
  let body: ApiErrorBody = {
    error: { code: "INTERNAL", message: "Something went wrong on our side. Please try again." },
  };

  if (err instanceof AppError) {
    status = err.status;
    body = { error: { code: err.code, message: err.message, details: err.details } };
  } else if (err instanceof mongoose.Error.CastError) {
    // e.g. /api/menu/not-an-object-id
    status = 404;
    body = { error: { code: "NOT_FOUND", message: "Not found." } };
  } else if (isBodyParserError(err)) {
    status = err.status;
    body = {
      error: {
        code: "VALIDATION_ERROR",
        message: err.type === "entity.too.large" ? "Request body is too large." : "Request body is not valid JSON.",
      },
    };
  }

  if (status >= 500) {
    logger.error(`${req.method} ${req.originalUrl} failed`, err);
  }
  res.status(status).json(body);
};

function isBodyParserError(err: unknown): err is { status: number; type: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    "status" in err &&
    typeof (err as { type: unknown }).type === "string" &&
    typeof (err as { status: unknown }).status === "number"
  );
}
