import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

const app = createApp();

describe("GET /api/health", () => {
  it("reports ok and a connected database", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok", db: "connected" });
  });

  it("unknown /api routes use the one error shape", async () => {
    const res = await request(app).get("/api/nope").expect(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Route GET /api/nope not found." } });
  });
});
