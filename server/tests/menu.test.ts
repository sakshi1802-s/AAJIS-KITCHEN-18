import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { MenuItemDTO, MenuListResponse } from "@shared/api";
import { createApp } from "../src/app";
import { MenuItem } from "../src/models/MenuItem";
import { makeMenuItem } from "./factories";

const app = createApp();

const names = (body: MenuListResponse) => body.items.map((i) => i.name);

describe("GET /api/menu", () => {
  beforeAll(async () => {
    await MenuItem.deleteMany({});
    await makeMenuItem({ name: "Kanda Pohe", nameMarathi: "कांदा पोहे", category: "breakfast", tags: ["breakfast", "light"] });
    await makeMenuItem({ name: "Sabudana Vada", nameMarathi: "साबुदाणा वडा", category: "upvas", tags: ["upvas", "fried"] });
    await makeMenuItem({ name: "Ukadiche Modak", category: "sweets", stockCount: 3, tags: ["sweet", "festive"] });
    await makeMenuItem({ name: "Chicken Rassa", category: "meals", isVeg: false, tags: ["spicy"] });
    await makeMenuItem({ name: "Bharli Vangi", category: "meals", isAvailable: false });
    await makeMenuItem({ name: "Old Dish", category: "snacks", isDeleted: true });
  });

  it("lists every non-deleted dish, including unavailable ones, in category order", async () => {
    const res = await request(app).get("/api/menu").expect(200);
    expect(names(res.body)).toEqual(["Kanda Pohe", "Bharli Vangi", "Chicken Rassa", "Ukadiche Modak", "Sabudana Vada"]);
  });

  it("returns the public DTO shape — prices in paise, nullable stock, no internals", async () => {
    const res = await request(app).get("/api/menu").expect(200);
    const modak = (res.body as MenuListResponse).items.find((i) => i.name === "Ukadiche Modak")!;
    expect(modak).toMatchObject({ price: 5000, stockCount: 3, isAvailable: true });
    expect(modak).not.toHaveProperty("isDeleted");
    expect(modak).not.toHaveProperty("_id");
    const pohe = (res.body as MenuListResponse).items.find((i) => i.name === "Kanda Pohe")!;
    expect(pohe.stockCount).toBeNull();
  });

  it("filters by category", async () => {
    const res = await request(app).get("/api/menu?category=meals").expect(200);
    expect(names(res.body)).toEqual(["Bharli Vangi", "Chicken Rassa"]);
  });

  it("filters veg / non-veg", async () => {
    const nonVeg = await request(app).get("/api/menu?isVeg=false").expect(200);
    expect(names(nonVeg.body)).toEqual(["Chicken Rassa"]);
    const veg = await request(app).get("/api/menu?isVeg=true").expect(200);
    expect(names(veg.body)).not.toContain("Chicken Rassa");
  });

  it("searches name, Marathi name and tags, case-insensitively", async () => {
    expect(names((await request(app).get("/api/menu?search=pohe")).body)).toEqual(["Kanda Pohe"]);
    expect(names((await request(app).get("/api/menu").query({ search: "वडा" })).body)).toEqual(["Sabudana Vada"]);
    expect(names((await request(app).get("/api/menu?search=FESTIVE")).body)).toEqual(["Ukadiche Modak"]);
  });

  it("treats regex characters in search as plain text", async () => {
    const res = await request(app).get("/api/menu").query({ search: ".*" }).expect(200);
    expect(res.body.items).toEqual([]);
  });

  it("rejects an unknown category with the one error shape", async () => {
    const res = await request(app).get("/api/menu?category=pizza").expect(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.message).toMatch(/category/);
  });
});

describe("GET /api/menu/:id", () => {
  it("returns one dish", async () => {
    const item = await makeMenuItem({ name: "Puran Poli" });
    const res = await request(app).get(`/api/menu/${item.id}`).expect(200);
    expect((res.body as MenuItemDTO).name).toBe("Puran Poli");
  });

  it("404s for a deleted dish, an unknown id, and a malformed id", async () => {
    const deleted = await makeMenuItem({ isDeleted: true });
    expect((await request(app).get(`/api/menu/${deleted.id}`)).status).toBe(404);
    expect((await request(app).get("/api/menu/64b000000000000000000000")).status).toBe(404);
    const bad = await request(app).get("/api/menu/not-an-id").expect(400);
    expect(bad.body.error.code).toBe("VALIDATION_ERROR");
  });
});
