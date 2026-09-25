import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { UserDTO } from "@shared/api";
import { createApp } from "../src/app";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { User } from "../src/models/User";

const app = createApp();

const account = (over: Record<string, unknown> = {}) => ({
  name: "Asha Kore",
  email: `asha.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@example.com`,
  password: "paithani-2026",
  ...over,
});

const cookieFrom = (res: request.Response) => {
  const header = res.headers["set-cookie"];
  return (Array.isArray(header) ? header : [header]).find((c) => c?.startsWith("aji_session="));
};

describe("password hashing", () => {
  it("never stores the password, and a different password never verifies", async () => {
    const hash = await hashPassword("paithani-2026");
    expect(hash).not.toContain("paithani-2026");
    expect(hash.startsWith("scrypt:")).toBe(true);
    expect(await verifyPassword("paithani-2026", hash)).toBe(true);
    expect(await verifyPassword("paithani-2025", hash)).toBe(false);
  });

  it("salts, so the same password hashes differently every time", async () => {
    expect(await hashPassword("same-password")).not.toBe(await hashPassword("same-password"));
  });

  it("an account with no password (Google sign-up) can never be matched", async () => {
    expect(await verifyPassword("anything", null)).toBe(false);
  });
});

describe("POST /api/auth/register", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("creates a customer, signs them in, and returns no password field", async () => {
    const body = account();
    const res = await request(app).post("/api/auth/register").send(body).expect(201);

    expect(res.body as UserDTO).toMatchObject({ name: body.name, email: body.email, role: "customer" });
    expect(res.body).not.toHaveProperty("passwordHash");
    expect(cookieFrom(res)).toMatch(/HttpOnly/i);

    const stored = await User.findOne({ email: body.email }).lean();
    expect(stored!.passwordHash).not.toBe(body.password);
    expect(stored!.googleId).toBeNull();
  });

  it("refuses an address that already has an account", async () => {
    const body = account();
    await request(app).post("/api/auth/register").send(body).expect(201);
    const second = await request(app).post("/api/auth/register").send(body).expect(409);
    expect(second.body.error.message).toMatch(/already has an account/i);
  });

  it("rejects a short password, a bad email and a missing name", async () => {
    await request(app).post("/api/auth/register").send(account({ password: "short" })).expect(400);
    await request(app).post("/api/auth/register").send(account({ email: "not-an-email" })).expect(400);
    await request(app).post("/api/auth/register").send(account({ name: "" })).expect(400);
  });

  it("a request body cannot grant itself the owner role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...account(), role: "owner" })
      .expect(201);
    expect((res.body as UserDTO).role).toBe("customer");
  });

  it("registering with the kitchen's address gives the owner role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(account({ email: process.env.OWNER_EMAIL }))
      .expect(201);
    expect((res.body as UserDTO).role).toBe("owner");
  });
});

describe("POST /api/auth/login", () => {
  it("signs in with the right password and keeps the session across requests", async () => {
    const body = account();
    await request(app).post("/api/auth/register").send(body).expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: body.password })
      .expect(200);

    const cookie = cookieFrom(res)!;
    const me = await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);
    expect((me.body as UserDTO).email).toBe(body.email);
  });

  it("says the same thing for a wrong password and an unknown address", async () => {
    const body = account();
    await request(app).post("/api/auth/register").send(body).expect(201);

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email: body.email, password: "not-the-password" })
      .expect(401);
    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: body.password })
      .expect(401);

    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
    expect(cookieFrom(wrongPassword)).toBeUndefined();
  });

  it("a Google account with no password cannot be signed into with one", async () => {
    await User.create({
      name: "Google Only",
      email: "google.only@example.com",
      googleId: "google-only-1",
      passwordHash: null,
      role: "customer",
    });

    await request(app)
      .post("/api/auth/login")
      .send({ email: "google.only@example.com", password: "anything-at-all" })
      .expect(401);
  });
});
