import type { Request, RequestHandler } from "express";
import type { z } from "zod";
import { BadRequest } from "../lib/errors";

type Part = "body" | "query" | "params";
type Schemas = Partial<Record<Part, z.ZodType>>;

/**
 * Runs before every handler that takes input. Parses each part with its Zod
 * schema and stores the result on `req.valid`; a failure becomes a 400
 * VALIDATION_ERROR listing every problem. Handlers never see unvalidated input.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    req.valid = {};
    const problems: { part: Part; path: string; message: string }[] = [];

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part] ?? {});
      if (result.success) {
        req.valid[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          problems.push({ part, path: issue.path.join("."), message: issue.message });
        }
      }
    }

    if (problems.length > 0) {
      const first = problems[0]!;
      const where = first.path ? `${first.path}: ` : "";
      throw BadRequest(`${where}${first.message}`, { issues: problems });
    }
    next();
  };
}

/** Typed read of what `validate` stored — the schema argument pins the type. */
export function valid<S extends z.ZodType>(req: Request, part: Part, _schema: S): z.infer<S> {
  return req.valid[part] as z.infer<S>;
}
