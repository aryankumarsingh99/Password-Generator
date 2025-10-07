import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "change_this";

export function signToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}