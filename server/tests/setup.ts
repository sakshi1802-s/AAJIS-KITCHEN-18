/**
 * Runs before every test file: connects to this run's throwaway MongoDB
 * (see globalSetup.ts) using a database name unique to the file, and drops it
 * afterwards.
 */
import mongoose from "mongoose";
import { afterAll, beforeAll, inject } from "vitest";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI ??= "mongodb://set-in-beforeAll";
process.env.JWT_SECRET = "test-jwt-secret-that-is-at-least-32-characters";
process.env.GOOGLE_CLIENT_ID = "test-google-client-id.apps.googleusercontent.com";
process.env.OWNER_EMAIL = "aji@example.com";
process.env.GEMINI_API_KEY = "";
process.env.N8N_WEBHOOK_URL = "";

beforeAll(async () => {
  const dbName = `aji_test_${process.pid}_${Math.random().toString(36).slice(2, 8)}`;
  await mongoose.connect(inject("mongoUri"), { dbName });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
