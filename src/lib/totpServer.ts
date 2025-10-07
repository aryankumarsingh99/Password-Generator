import { authenticator } from "otplib";

export function generateTotpSecret(label: string, issuer = "PasswordVault") {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(label, issuer, secret);
  return { secret, otpauth };
}

export async function generateTotpQRDataUrl(otpauth: string): Promise<string> {
  const QRCode = (await import("qrcode")).default ?? (await import("qrcode"));
  return QRCode.toDataURL(otpauth);
}

export function verifyTotpToken(secret: string, token: string): boolean {
  return authenticator.check(token, secret);
}

// example usage (no file change required)
const secret = authenticator.generateSecret();
const otpauth = authenticator.keyuri("user@example.com", "YourApp", secret);
const valid = authenticator.check("123456", secret); // verify token