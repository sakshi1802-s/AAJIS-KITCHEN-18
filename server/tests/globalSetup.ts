import { MongoMemoryServer } from "mongodb-memory-server";
import type { TestProject } from "vitest/node";

/**
 * One throwaway MongoDB for the whole test run (starting one per file was slow
 * enough to trip the hook timeout). Each test file still gets its own database
 * inside it, so files stay isolated and can run in parallel.
 *
 * Set TEST_MONGODB_URI to run the suite against a real cluster instead.
 */
declare module "vitest" {
  interface ProvidedContext {
    mongoUri: string;
  }
}

export default async function setup(project: TestProject) {
  const external = process.env.TEST_MONGODB_URI;
  if (external) {
    project.provide("mongoUri", external);
    return;
  }

  const mongod = await MongoMemoryServer.create();
  project.provide("mongoUri", mongod.getUri());

  return async () => {
    await mongod.stop();
  };
}
