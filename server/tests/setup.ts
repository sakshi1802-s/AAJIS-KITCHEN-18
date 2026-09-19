/**
 * Runs before every test file. Each file gets its own throwaway MongoDB:
 * an in-memory mongod (mongodb-memory-server), or — if TEST_MONGODB_URI is
 * set — a uniquely named database on that cluster, dropped afterwards.
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, beforeAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI ??= "mongodb://set-in-beforeAll";
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id.apps.googleusercontent.com";
process.env.OWNER_EMAIL = "aji@example.com";
process.env.GEMINI_API_KEY = "";
process.env.N8N_WEBHOOK_URL = "";

let mongod: MongoMemoryServer | undefined;

beforeAll(async () => {
  let uri: string;
  const external = process.env.TEST_MONGODB_URI;
  if (external) {
    const dbName = `aji_test_${process.pid}_${Date.now()}`;
    uri = external.replace(/\/(\?|$)/, `/${dbName}$1`);
  } else {
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri("aji_test");
  }
  await mongoose.connect(uri);
});

afterAll(async () => {
  if (process.env.TEST_MONGODB_URI) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongod?.stop();
});
