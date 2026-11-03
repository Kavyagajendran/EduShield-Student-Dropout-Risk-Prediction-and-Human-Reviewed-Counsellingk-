import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<string> => {
  const primaryUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/edushield";

  try {
    // Attempt standard connection with 2.5s timeout
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`Connected to MongoDB instance at: ${primaryUri}`);
    return primaryUri;
  } catch (err: any) {
    console.warn(`Standard MongoDB connection to ${primaryUri} failed: ${err.message}.`);
    console.log("Initializing high-performance in-memory MongoDB fallback server...");

    try {
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const memUri = memoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to In-Memory MongoDB at: ${memUri}`);
      return memUri;
    } catch (memErr: any) {
      console.error("Failed to start in-memory MongoDB server:", memErr);
      throw memErr;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
  }
};

