import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";
import { verifyTotpToken } from "@/lib/totpServer";

function getToken(req: NextRequest) {
  const a = req.headers.get("authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  return a.slice(7);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { secret, code } = body;
  if (!secret || !code) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const ok = verifyTotpToken(secret, String(code));
  if (!ok) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const db = await getDb();
  await db.collection("users").updateOne({ _id: payload.sub ? { $eq: payload.sub } : { $exists: false } }, { $set: { totpSecret: secret } });
  // NOTE: adapt selector above to your user id field
  return NextResponse.json({ ok: true });
}