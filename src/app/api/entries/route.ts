import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

function getToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const entries = await db.collection("entries").find({ userId: payload.sub }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(entries.map((e) => ({ ...e, id: e._id.toString() })));
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();
  const doc = { userId: payload.sub, ...body, createdAt: now };
  const db = await getDb();
  const r = await db.collection("entries").insertOne(doc);
  return NextResponse.json({ ok: true, id: r.insertedId.toString() });
}