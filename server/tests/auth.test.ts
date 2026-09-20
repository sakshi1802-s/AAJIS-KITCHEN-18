import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserDTO } from "@shared/api";
import { User } from "../src/models/User";
import { makeUser, sessionCookie } from "./helpers/session";

// Stand in for Google: every test decides what the "ID token" verifies to.
const verifyIdToken = vi.fn();
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

const { createApp } = await import("../src/app");
const app = createApp();

const googlePayload = (over: Record<string, unknown> = {}) => ({
  getPayload: () => ({
    sub: "google-uid-1",
    email: "asha@example.com",
    email_verified: true,
    name: "Asha Kore",
    ...over,
  }),
});

const cookieFrom = (res: request.Response) => {
  const header = res.headers["set-cookie"];
  return (Array.isArray(header) ? header : [header]).find((c) => c?.startsWith("aji_session="));
};

describe("POST /api/auth/google", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    verifyIdToken.mockReset();
  });

  it("verifies the token against our own client id and creates the user", async () => {
    verifyIdToken.mockResolvedValue(googlePayload());

    const res = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);

    expect(verifyIdToken).toHaveBeenCalledWith({
      idToken: "x".repeat(30),
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const body = res.body as UserDTO;
    expect(body).toMatchObject({ name: "Asha Kore", email: "asha@example.com", role: "customer" });
    expect(body).not.toHaveProperty("googleId");
  });

  it("sets an httpOnly, lax, path-wide session cookie", async () => {
    verifyIdToken.mockResolvedValue(googlePayload());
    const cookie = cookieFrom(await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }));
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Path=\//i);
  });

  it("signing in twice reuses the same user and refreshes the profile", async () => {
    verifyIdToken.mockResolvedValue(googlePayload());
    await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);

    verifyIdToken.mockResolvedValue(googlePayload({ name: "Asha K." }));
    const res = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);

    expect((res.body as UserDTO).name).toBe("Asha K.");
    expect(await User.countDocuments({})).toBe(1);
  });

  it("gives the owner role only to OWNER_EMAIL", async () => {
    verifyIdToken.mockResolvedValue(googlePayload({ sub: "google-aji", email: process.env.OWNER_EMAIL }));
    const owner = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);
    expect((owner.body as UserDTO).role).toBe("owner");

    verifyIdToken.mockResolvedValue(googlePayload());
    const customer = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);
    expect((customer.body as UserDTO).role).toBe("customer");
  });

  it("a request body can never ask for the owner role", async () => {
    verifyIdToken.mockResolvedValue(googlePayload());
    const res = await request(app)
      .post("/api/auth/google")
      .send({ credential: "x".repeat(30), role: "owner", userId: "64b000000000000000000000" })
      .expect(200);
    expect((res.body as UserDTO).role).toBe("customer");
  });

  it("401s when Google rejects the token, with no cookie", async () => {
    verifyIdToken.mockRejectedValue(new Error("Invalid token signature"));
    const res = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(401);
    expect(res.body.error.code).toBe("UNAUTHENTICATED");
    expect(cookieFrom(res)).toBeUndefined();
  });

  it("403s an unverified Google email", async () => {
    verifyIdToken.mockResolvedValue(googlePayload({ email_verified: false }));
    const res = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("400s a missing credential", async () => {
    const res = await request(app).post("/api/auth/google").send({}).expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("session", () => {
  it("GET /api/auth/me returns the signed-in user and survives a fresh request", async () => {
    verifyIdToken.mockResolvedValue(googlePayload({ sub: "google-uid-me", email: "me@example.com" }));
    const signIn = await request(app).post("/api/auth/google").send({ credential: "x".repeat(30) }).expect(200);
    const cookie = cookieFrom(signIn)!;

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie).expect(200);
    expect((me.body as UserDTO).email).toBe("me@example.com");
  });

  it("401s without a cookie, with a junk cookie, and with a token signed by someone else", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set("Cookie", "aji_session=garbage")).status).toBe(401);

    const jwt = (await import("jsonwebtoken")).default;
    const forged = jwt.sign({ role: "owner" }, "not-the-server-secret", { subject: "64b000000000000000000000" });
    expect((await request(app).get("/api/auth/me").set("Cookie", `aji_session=${forged}`)).status).toBe(401);
  });

  it("401s when the user behind a valid cookie no longer exists", async () => {
    const user = await makeUser();
    const cookie = sessionCookie(user);
    await User.deleteOne({ _id: user._id });
    expect((await request(app).get("/api/auth/me").set("Cookie", cookie)).status).toBe(401);
  });

  it("trusts the database for the role, not the token", async () => {
    const user = await makeUser({ role: "customer" });
    const jwt = (await import("jsonwebtoken")).default;
    // A cookie that *claims* owner, signed with the real secret.
    const claimsOwner = jwt.sign({ role: "owner" }, process.env.JWT_SECRET!, { subject: user.id });
    const res = await request(app)
      .patch("/api/users/me")
      .set("Cookie", `aji_session=${claimsOwner}`)
      .send({ name: "Still A Customer" })
      .expect(200);
    expect((res.body as UserDTO).role).toBe("customer");
  });

  it("POST /api/auth/logout clears the cookie", async () => {
    const res = await request(app).post("/api/auth/logout").expect(204);
    expect(cookieFrom(res)).toMatch(/aji_session=;/);
  });
});
