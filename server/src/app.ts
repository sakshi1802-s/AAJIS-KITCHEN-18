import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env, isProd } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.routes";
import { healthRouter } from "./routes/health.routes";
import { menuRouter } from "./routes/menu.routes";
import { ordersRouter } from "./routes/orders.routes";
import { usersRouter } from "./routes/users.routes";

/** Builds the Express app without listening — tests import this directly. */
export function createApp() {
  const app = express();

  // Render (and Vercel's rewrite) sit in front of us; trust one proxy hop so
  // secure cookies and rate-limit IPs see the real client.
  if (isProd) app.set("trust proxy", 1);

  app.disable("x-powered-by");
  app.use(helmet());
  // The client normally talks to us same-origin (Vite proxy in dev, Vercel
  // rewrite in prod). CORS is still locked to the one exact origin.
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.use("/api/health", healthRouter);
  app.use("/api/menu", menuRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/orders", ordersRouter);

  app.use("/api", notFoundHandler);
  app.use(errorHandler);

  return app;
}
