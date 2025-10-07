// Minimal Web Crypto helpers used by VaultPanel — safe to import on client only (no crypto calls at module top-level).
export async function deriveKeyFromPassword(password: string, salt: string) {
  const enc = new TextEncoder();
  const pw = enc.encode(password || "");
  const saltBytes = enc.encode(salt || "pv_salt");
  const baseKey = await crypto.subtle.importKey("raw", pw, "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations: 200_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  return key;
}

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

export async function encryptString(plain: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain));
  return {
    iv: toBase64(iv.buffer),
    data: toBase64(ct),
  };
}

export async function decryptString(payload: { iv: string; data: string } | null | undefined, key: CryptoKey) {
  if (!payload || !payload.iv || !payload.data) return "";
  const iv = new Uint8Array(fromBase64(payload.iv));
  const ct = fromBase64(payload.data);
  const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(dec);
}

type EntryField = { iv: string; data: string } | null;
type EntryRecord = Record<string, unknown>;

export async function encryptEntryObject(obj: EntryRecord, key: CryptoKey) {
  const out: Record<string, EntryField> = {};
  const fields = ["title", "username", "password", "url", "notes", "tags", "folder"];
  for (const k of fields) {
    const v = obj[k];
    if (v == null || v === "") {
      out[k] = null;
      continue;
    }
    const val = Array.isArray(v) ? JSON.stringify(v) : String(v);
    out[k] = await encryptString(val, key);
  }
  return out;
}

export async function decryptEntryObject(doc: EntryRecord, key: CryptoKey) {
  const id =
    (doc as any).id ??
    (doc as any)._id ??
    (typeof (doc as any)._id?.toString === "function" ? (doc as any)._id.toString() : undefined);
  const out: Record<string, unknown> = { id };
  const fields = ["title", "username", "password", "url", "notes", "tags", "folder"];
  for (const k of fields) {
    const v = doc[k];
    if (v == null) {
      out[k] = "";
      continue;
    }
    try {
      if (typeof v === "object" && v !== null && "iv" in (v as any) && "data" in (v as any)) {
        const dec = await decryptString(v as { iv: string; data: string }, key);
        if (k === "tags") {
          try {
            out.tags = JSON.parse(dec);
          } catch {
            out.tags = dec.split?.(",").map((s: string) => s.trim()) ?? [dec];
          }
        } else out[k] = dec;
      } else {
        out[k] = v;
      }
    } catch {
      out[k] = "";
    }
  }
  return out;
}

// Export / import helpers: operate on already-encrypted server blobs
export function exportEncryptedEntries(entries: unknown[]) {
  return new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
}

export async function importEncryptedFile(file: File) {
  const txt = await file.text();
  return JSON.parse(txt) as unknown;
}