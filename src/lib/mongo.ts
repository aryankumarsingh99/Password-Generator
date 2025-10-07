"use server";
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || process.env.MONGODB_URI_FALLBACK || "";

let cached: { client: MongoClient } | null = null;

export async function getClient() {
  if (cached) return cached.client;

  if (!URI) {
    // do not throw on import time; throw with clear message when trying to use DB
    const msg = "MONGODB_URI not set. Add MONGODB_URI (or MONGODB_URI_FALLBACK) to environment variables.";
    console.error(msg);
    throw new Error(msg);
  }

  try {
    const client = new MongoClient(URI, {
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });
    await client.connect();
    cached = { client };
    console.info("Mongo connected");
    return client;
  } catch (err) {
    console.error("Mongo connect error:", err?.stack ?? err);
    throw err;
  }
}

export async function getDb() {
  const client = await getClient();
  return client.db();
}