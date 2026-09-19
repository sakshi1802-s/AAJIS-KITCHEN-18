import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const idParams = z.object({ id: objectId });

/** Query-string booleans arrive as "true" / "false". */
export const queryBoolean = z.enum(["true", "false"]).transform((v) => v === "true");
