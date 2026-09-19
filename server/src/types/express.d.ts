import type { Role } from "@shared/api";

declare global {
  namespace Express {
    interface Request {
      /** Parsed, Zod-validated input, set by the `validate` middleware. */
      valid: { body?: unknown; query?: unknown; params?: unknown };
      /** Set by `requireAuth` — always derived from the JWT, never the body. */
      user?: { id: string; role: Role };
    }
  }
}

export {};
