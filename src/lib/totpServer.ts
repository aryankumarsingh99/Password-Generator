import { authenticator } from "otplib";
import QRCode from "qrcode";

export function generateTotpSecret(label: string, issuer = "PasswordVault") {
  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(label, issuer, secret);
  return { secret, otpauth };
}

export async function generateTotpQRDataUrl(otpauth: string) {
  return await QRCode.toDataURL(otpauth);
}

export function verifyTotpToken(secret: string, token: string) {
  return authenticator.check(token, secret);
}