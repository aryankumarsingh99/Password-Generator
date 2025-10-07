import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import { verifyToken } from "@/lib/jwt";
import { generateTotpSecret, generateTotpQRDataUrl } from "@/lib/totpServer";

function getToken(req: NextRequest) {
  const a = req.headers.get("authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  return a.slice(7);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const email = payload.email || payload.sub;
  const { secret, otpauth } = generateTotpSecret(String(email));
  const qr = await generateTotpQRDataUrl(otpauth);

  // Do NOT persist secret yet — persist only after verification step
  return NextResponse.json({ secret, otpauth, qr });
}