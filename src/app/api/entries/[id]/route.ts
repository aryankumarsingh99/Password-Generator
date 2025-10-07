import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongo";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const db = await getDb();
    const { id } = params;

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    await db.collection("entries").updateOne(filter, { $set: body }, { upsert: false });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("entries/[id] PUT error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
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