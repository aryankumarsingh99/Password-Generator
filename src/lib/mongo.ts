"use server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const fallback = process.env.MONGODB_URI_FALLBACK || "";

if (!uri && !fallback) {
  console.error("MONGODB_URI (or MONGODB_URI_FALLBACK) is not set in .env.local");
}

let cached: { client: MongoClient } | null = null;

export async function getClient() {
  if (cached) return cached.client;

  const tryUris = uri ? [uri] : [];
  if (fallback) tryUris.push(fallback);

  let lastErr: any = null;
  for (const u of tryUris) {
    try {
      const client = new MongoClient(u, {
        connectTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
        // family: 4, // uncomment if IPv6 issues
      });
      await client.connect();
      console.info("Mongo connected using URI:", u.startsWith("mongodb+srv:") ? "mongodb+srv (SRV)" : "standard");
      cached = { client };
      return client;
    } catch (err) {
      lastErr = err;
      console.error("Mongo connect attempt failed for URI:", u);
      console.error(err?.stack ?? err);
      // If SRV DNS timeout, give specific guidance
      if (String(err).includes("querySrv ETIMEOUT") || String(err).includes("getaddrinfo ENOTFOUND")) {
        console.error("SRV DNS lookup timed out. Try the Atlas 'Standard connection string (without SRV)' and set it as MONGODB_URI_FALLBACK in .env.local, or check firewall/VPN/DNS.");
      }
    }
  }

  // nothing worked
  throw lastErr ?? new Error("Mongo connection failed (no URIs tried)");
}

export async function getDb() {
  const client = await getClient();
  return client.db(); // uses DB from connection string
}