import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Vault from "../../../models/Vault";

/**
 * POST -> upsert a named vault blob
 *   body: { name: string, blob: string, meta?: object }
 * GET  -> fetch named vault
 *   query: ?name=...
 * DELETE -> delete named vault
 *   body: { name: string }
 *
 * Note: this API stores only the encrypted blob. No plaintext handling.
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, blob, meta } = body || {};
    if (!name || !blob) {
      return NextResponse.json({ success: false, message: "name and blob required" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Vault.findOneAndUpdate(
      { name },
      { blob, meta: meta || {} },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return NextResponse.json({
      success: true,
      vault: { id: doc._id, name: doc.name, updatedAt: doc.updatedAt }
    });
  } catch (err) {
    console.error("POST /api/vault error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    if (!name) {
      return NextResponse.json({ success: false, message: "name query param required" }, { status: 400 });
    }

    await dbConnect();
    const doc = await Vault.findOne({ name }).lean();
    if (!doc) return NextResponse.json({ success: false, message: "not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      vault: { name: doc.name, blob: doc.blob, meta: doc.meta, updatedAt: doc.updatedAt }
    });
  } catch (err) {
    console.error("GET /api/vault error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { name } = body || {};
    if (!name) {
      return NextResponse.json({ success: false, message: "name required" }, { status: 400 });
    }

    await dbConnect();
    await Vault.deleteOne({ name });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/vault error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}