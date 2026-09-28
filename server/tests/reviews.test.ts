import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { ReviewDTO, ReviewsListResponse } from "@shared/api";
import { createApp } from "../src/app";
import { Review } from "../src/models/Review";
import { makeUser, sessionCookie, kitchenCookie } from "./helpers/session";

const app = createApp();

const review = (over: Record<string, unknown> = {}) => ({
  occasion: "Ganpati at home",
  rating: 5,
  text: "Twenty-one modak delivered warm at eight in the morning. Exactly as promised.",
  ...over,
});

describe("leaving a review", () => {
  beforeEach(async () => {
    await Review.deleteMany({});
  });

  it("a signed-in customer can leave one, and it starts unpublished", async () => {
    const customer = await makeUser({ name: "Meenal Deshpande" });
    const res = await request(app)
      .post("/api/reviews")
      .set("Cookie", sessionCookie(customer))
      .send(review())
      .expect(201);

    expect(res.body as ReviewDTO).toMatchObject({
      name: "Meenal Deshpande",
      occasion: "Ganpati at home",
      rating: 5,
      isPublished: false,
    });
  });

  it("nothing a customer writes shows publicly until Aaji publishes it", async () => {
    const customer = await makeUser();
    const created = await request(app)
      .post("/api/reviews")
      .set("Cookie", sessionCookie(customer))
      .send(review())
      .expect(201);

    const before = await request(app).get("/api/reviews").expect(200);
    expect((before.body as ReviewsListResponse).reviews).toHaveLength(0);

    const aji = await makeUser({ role: "owner" });
    await request(app)
      .patch(`/api/owner/reviews/${(created.body as ReviewDTO).id}`)
      .set("Cookie", kitchenCookie(aji))
      .send({ isPublished: true })
      .expect(200);

    const after = await request(app).get("/api/reviews").expect(200);
    expect((after.body as ReviewsListResponse).reviews).toHaveLength(1);
  });

  it("Aaji can take a published review back down", async () => {
    const customer = await makeUser();
    const aji = await makeUser({ role: "owner" });
    const created = await request(app)
      .post("/api/reviews")
      .set("Cookie", sessionCookie(customer))
      .send(review())
      .expect(201);
    const id = (created.body as ReviewDTO).id;

    await request(app).patch(`/api/owner/reviews/${id}`).set("Cookie", kitchenCookie(aji)).send({ isPublished: true });
    await request(app).patch(`/api/owner/reviews/${id}`).set("Cookie", kitchenCookie(aji)).send({ isPublished: false });

    const published = await request(app).get("/api/reviews").expect(200);
    expect((published.body as ReviewsListResponse).reviews).toHaveLength(0);
  });

  it("needs an account, and validates the rating and the text", async () => {
    await request(app).post("/api/reviews").send(review()).expect(401);

    const customer = await makeUser();
    const cookie = sessionCookie(customer);
    await request(app).post("/api/reviews").set("Cookie", cookie).send(review({ rating: 9 })).expect(400);
    await request(app).post("/api/reviews").set("Cookie", cookie).send(review({ rating: 0 })).expect(400);
    await request(app).post("/api/reviews").set("Cookie", cookie).send(review({ text: "nice" })).expect(400);
  });

  it("a customer sees their own reviews but cannot reach Aaji's queue or publish", async () => {
    const customer = await makeUser();
    const cookie = sessionCookie(customer);
    const created = await request(app).post("/api/reviews").set("Cookie", cookie).send(review()).expect(201);

    const mine = await request(app).get("/api/reviews/me").set("Cookie", cookie).expect(200);
    expect((mine.body as ReviewsListResponse).reviews).toHaveLength(1);

    // A shop session is not a session at the kitchen door at all.
    await request(app).get("/api/owner/reviews").set("Cookie", cookie).expect(401);
    // And at that door, the role still decides.
    await request(app).get("/api/owner/reviews").set("Cookie", kitchenCookie(customer)).expect(403);
    await request(app)
      .patch(`/api/owner/reviews/${(created.body as ReviewDTO).id}`)
      .set("Cookie", kitchenCookie(customer))
      .send({ isPublished: true })
      .expect(403);
  });

  it("Aaji's queue shows unpublished ones too", async () => {
    const customer = await makeUser();
    const aji = await makeUser({ role: "owner" });
    await request(app).post("/api/reviews").set("Cookie", sessionCookie(customer)).send(review()).expect(201);

    const queue = await request(app).get("/api/owner/reviews").set("Cookie", kitchenCookie(aji)).expect(200);
    expect((queue.body as ReviewsListResponse).reviews[0]).toMatchObject({ isPublished: false });
  });
});
