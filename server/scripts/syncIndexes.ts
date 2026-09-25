/**
 * Makes the database's indexes match the models.
 *
 * Mongoose creates missing indexes on its own, but it will not change one
 * that already exists with different options. That bit us once: `googleId`
 * started as a plain unique index, and when it became a partial one (unique
 * only among accounts that actually have a Google id) the old index stayed
 * behind, so the second email/password signup failed with a duplicate key on
 * `googleId: null`.
 *
 * Run this after changing an index: `npm run sync-indexes`.
 */
import { env } from "../src/config/env";
import { connectDB, disconnectDB } from "../src/lib/db";
import { logger } from "../src/lib/logger";
import { MenuItem } from "../src/models/MenuItem";
import { Order } from "../src/models/Order";
import { Review } from "../src/models/Review";
import { User } from "../src/models/User";

const MODELS = [User, MenuItem, Order, Review];

async function main(): Promise<void> {
  await connectDB(env.MONGODB_URI);

  for (const model of MODELS) {
    // syncIndexes drops indexes the schema no longer declares, then builds
    // the ones it does.
    const dropped = await model.syncIndexes();
    logger.info(
      `${model.modelName}: ${dropped.length > 0 ? `dropped ${dropped.join(", ")}` : "already in sync"}`,
    );
  }

  await disconnectDB();
}

main().catch((error: unknown) => {
  logger.error("Index sync failed", error);
  process.exitCode = 1;
});
