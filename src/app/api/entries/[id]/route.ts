import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";
import { ObjectId } from "mongodb";

function getToken(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const db = await getDb();
  const id = params.id;
  const doc = await db.collection("entries").findOne({ _id: new ObjectId(id) });
  if (!doc || doc.userId !== payload.sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.collection("entries").updateOne({ _id: new ObjectId(id) }, { $set: { ...body } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const id = params.id;
  const doc = await db.collection("entries").findOne({ _id: new ObjectId(id) });
  if (!doc || doc.userId !== payload.sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.collection("entries").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ ok: true });
}