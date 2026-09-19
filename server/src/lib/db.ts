import mongoose from "mongoose";
import { logger } from "./logger";

export async function connectDB(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
  logger.info(`MongoDB connected (${mongoose.connection.name})`);
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

export const isDbConnected = () => mongoose.connection.readyState === 1;
