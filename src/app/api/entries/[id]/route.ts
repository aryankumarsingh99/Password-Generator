import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "../../../../lib/mongo";
import { verifyToken } from "../../../../lib/jwt";

/** helper to extract Bearer token from Request */
function getToken(req: Request) {
  const a = req.headers.get("authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  return a.slice(7);
}

/** PUT must use the Request + context shape expected by Next.js App Router */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id } = params;
    const db = await getDb();

    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    await db.collection("entries").updateOne(filter, { $set: body }, { upsert: false });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("entries/[id] PUT error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token = getToken(req);
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await getDb();
    const id = params.id;
    const doc = await db.collection("entries").findOne({ _id: new ObjectId(id) });
    if (!doc || doc.userId !== payload.sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await db.collection("entries").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("entries/[id] DELETE error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}