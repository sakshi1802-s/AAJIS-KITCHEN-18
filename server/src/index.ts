import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./lib/db";
import { logger } from "./lib/logger";

async function main() {
  await connectDB(env.MONGODB_URI);
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close();
    await disconnectDB();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err: unknown) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
