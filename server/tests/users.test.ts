import request from "supertest";
import { describe, expect, it } from "vitest";
import type { UserDTO } from "@shared/api";
import { createApp } from "../src/app";
import { makeUser, sessionCookie } from "./helpers/session";

const app = createApp();

const address = (over: Record<string, unknown> = {}) => ({
  label: "Home",
  line1: "Flat 3, Shanti Nivas",
  line2: "Off FC Road",
  city: "Pune",
  pincode: "411004",
  ...over,
});

describe("PATCH /api/users/me", () => {
  it("updates name and normalises the phone number", async () => {
    const user = await makeUser();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Cookie", sessionCookie(user))
      .send({ name: "Sakshi Kore", phone: "+91 98765 43210" })
      .expect(200);

    expect(res.body as UserDTO).toMatchObject({ name: "Sakshi Kore", phone: "9876543210" });
  });

  it("rejects a phone number that isn't an Indian mobile", async () => {
    const user = await makeUser();
    const res = await request(app)
      .patch("/api/users/me")
      .set("Cookie", sessionCookie(user))
      .send({ phone: "12345" })
      .expect(400);
    expect(res.body.error.message).toMatch(/10-digit/);
  });

  it("401s when signed out", async () => {
    await request(app).patch("/api/users/me").send({ name: "Nobody" }).expect(401);
  });
});

describe("addresses", () => {
  it("makes the first address the default and moves the default on request", async () => {
    const user = await makeUser();
    const cookie = sessionCookie(user);

    const first = await request(app).post("/api/users/me/addresses").set("Cookie", cookie).send(address()).expect(201);
    expect((first.body as UserDTO).addresses).toHaveLength(1);
    expect((first.body as UserDTO).addresses[0]!.isDefault).toBe(true);

    const second = await request(app)
      .post("/api/users/me/addresses")
      .set("Cookie", cookie)
      .send(address({ label: "Aai's place", isDefault: true }))
      .expect(201);

    const defaults = (second.body as UserDTO).addresses.filter((a) => a.isDefault);
    expect(defaults).toHaveLength(1);
    expect(defaults[0]!.label).toBe("Aai's place");
  });

  it("deleting the default promotes another address", async () => {
    const user = await makeUser();
    const cookie = sessionCookie(user);
    await request(app).post("/api/users/me/addresses").set("Cookie", cookie).send(address()).expect(201);
    const two = await request(app)
      .post("/api/users/me/addresses")
      .set("Cookie", cookie)
      .send(address({ label: "Office" }))
      .expect(201);

    const defaultId = (two.body as UserDTO).addresses.find((a) => a.isDefault)!.id;
    const after = await request(app).delete(`/api/users/me/addresses/${defaultId}`).set("Cookie", cookie).expect(200);

    const left = (after.body as UserDTO).addresses;
    expect(left).toHaveLength(1);
    expect(left[0]!.isDefault).toBe(true);
  });

  it("one customer cannot delete another customer's address", async () => {
    const owner = await makeUser();
    const other = await makeUser();
    const created = await request(app)
      .post("/api/users/me/addresses")
      .set("Cookie", sessionCookie(owner))
      .send(address())
      .expect(201);
    const addressId = (created.body as UserDTO).addresses[0]!.id;

    await request(app).delete(`/api/users/me/addresses/${addressId}`).set("Cookie", sessionCookie(other)).expect(404);
  });

  it("validates pincode and required fields", async () => {
    const user = await makeUser();
    const res = await request(app)
      .post("/api/users/me/addresses")
      .set("Cookie", sessionCookie(user))
      .send(address({ pincode: "41" }))
      .expect(400);
    expect(res.body.error.message).toMatch(/pincode/i);
  });
});
