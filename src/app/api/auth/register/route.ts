import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
// use relative path to avoid unresolved alias in this file
import { getDb } from "../../../../lib/mongo";

export async function POST(req: Request) {
  try {
    console.log("Register route hit");
    console.log("MONGODB_URI present:", !!process.env.MONGODB_URI);

    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      console.warn("Missing fields", { email, passwordPresent: !!password });
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const db = await getDb();
    console.log("Connected to DB");
    const users = db.collection("users");
    const existing = await users.findOne({ email: String(email).toLowerCase() });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hash = await bcrypt.hash(String(password), 10);
    const now = new Date().toISOString();
    const res = await users.insertOne({ email: String(email).toLowerCase(), passwordHash: hash, createdAt: now });
    console.log("User created", String(res.insertedId));
    return NextResponse.json({ ok: true, id: String(res.insertedId) });
  } catch (err: any) {
    console.error("Register error:", err?.message ?? err);
    return new Response(JSON.stringify({ error: "Database connection failed", details: err?.message ?? "unknown" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}