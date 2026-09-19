import type { RequestHandler } from "express";
import type { HealthDTO } from "@shared/api";
import { isDbConnected } from "../lib/db";

export const getHealth: RequestHandler = (_req, res) => {
  const body: HealthDTO = {
    status: "ok",
    db: isDbConnected() ? "connected" : "disconnected",
    uptimeSeconds: Math.round(process.uptime()),
    time: new Date().toISOString(),
  };
  res.json(body);
};
