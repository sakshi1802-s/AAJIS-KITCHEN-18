import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@shared": path.resolve(import.meta.dirname, "../types") },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    // One in-memory MongoDB per test file; files run in parallel workers.
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
