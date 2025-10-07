import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change_this_to_secure";

export function signToken(payload: Record<string, unknown>, expiresIn = "7d"): string {
  return jwt.sign(payload as JwtPayload, SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);
    if (typeof decoded === "string") return null;
    return decoded as JwtPayload;
  } catch {
    return null;
  }
}