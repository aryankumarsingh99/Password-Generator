"use client";
import { useEffect, useState } from "react";
import { VaultEntry } from "../types";

/**
 * Client-side vault:
 * - localStorage: pv_vault_v1 (encrypted blob)
 * - local account: pv_user_v1 (email + pwHash only)
 * - in-memory derived CryptoKey kept for session while unlocked
 */

const STORAGE_KEY = "pv_vault_v1";
const USER_KEY = "pv_user_v1";
const SESSION_UNLOCKED = "pv_unlocked";

function bufToBase64(buf: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToBuf(b64: string) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}
async function sha256Base64(text: string) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return bufToBase64(hash);
}
async function deriveKey(password: string, saltBuf: ArrayBuffer) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBuf, iterations: 250000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptData(key: CryptoKey, plainText: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plainText));
  return { iv: bufToBase64(iv.buffer), data: bufToBase64(ct) };
}
async function decryptData(key: CryptoKey, ivB64: string, dataB64: string) {
  const iv = new Uint8Array(base64ToBuf(ivB64));
  const ct = base64ToBuf(dataB64);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  return new TextDecoder().decode(plain);
}

export default function useVault() {
  const [lock, setLock] = useState(true);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const u = localStorage.getItem(USER_KEY);
    if (u) {
      try {
        const parsed = JSON.parse(u);
        if (parsed?.email) setUser({ email: parsed.email });
      } catch {}
    }
    const unlocked = sessionStorage.getItem(SESSION_UNLOCKED);
    if (unlocked) setLock(true);
  }, []);

  // register (stores email + pwHash locally) and create vault
  const register = async (email: string, password: string) => {
    if (!email || !password) throw new Error("email & password required");
    const pwHash = await sha256Base64(password);
    localStorage.setItem(USER_KEY, JSON.stringify({ email, pwHash }));
    setUser({ email });
    await unlock(password);
    return true;
  };

  const login = async (email: string, password: string) => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) throw new Error("No user registered");
    const parsed = JSON.parse(raw);
    if (parsed.email !== email) throw new Error("User not found");
    const pwHash = await sha256Base64(password);
    if (pwHash !== parsed.pwHash) throw new Error("Invalid credentials");
    await unlock(password);
    return true;
  };

  const logoutUser = () => {
    lockVault();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  const unlock = async (password: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await deriveKey(password, salt.buffer);
        const payload = JSON.stringify([]);
        const cipher = await encryptData(key, payload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: bufToBase64(salt.buffer), iv: cipher.iv, data: cipher.data }));
        setEntries([]);
        setMasterKey(key);
        setLock(false);
        sessionStorage.setItem(SESSION_UNLOCKED, "1");
        return true;
      }

      const parsed = JSON.parse(stored);
      const saltBuf = base64ToBuf(parsed.salt);
      const key = await deriveKey(password, saltBuf);
      const plain = await decryptData(key, parsed.iv, parsed.data);
      const parsedEntries = JSON.parse(plain) as VaultEntry[];
      setEntries(parsedEntries);
      setMasterKey(key);
      setLock(false);
      sessionStorage.setItem(SESSION_UNLOCKED, "1");
      return true;
    } catch (err) {
      console.error("Unlock error", err);
      throw new Error("Failed to unlock vault (wrong password or corrupted data).");
    }
  };

  const lockVault = () => {
    setEntries([]);
    setMasterKey(null);
    setLock(true);
    sessionStorage.removeItem(SESSION_UNLOCKED);
  };

  // destructive reset (with optional clipboard backup)
  const resetVault = async (newPassword: string) => {
    if (!newPassword) throw new Error("Password required");
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      const keep = confirm("Copy encrypted vault to clipboard before resetting? (Still needs old password to decrypt)");
      if (keep) {
        try { await navigator.clipboard.writeText(existing); alert("Encrypted vault copied to clipboard."); } catch {}
      }
    }
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(newPassword, salt.buffer);
    const cipher = await encryptData(key, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: bufToBase64(salt.buffer), iv: cipher.iv, data: cipher.data }));
    setEntries([]);
    setMasterKey(key);
    setLock(false);
    sessionStorage.setItem(SESSION_UNLOCKED, "1");
    return true;
  };

  const getSaltB64 = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored).salt; } catch { return ""; }
    }
    return "";
  };

  const persistWithKey = async (key: CryptoKey | null, dataObj: VaultEntry[]) => {
    if (key) {
      const cipher = await encryptData(key, JSON.stringify(dataObj));
      const saltB64 = getSaltB64() || bufToBase64(crypto.getRandomValues(new Uint8Array(16)).buffer);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: saltB64, iv: cipher.iv, data: cipher.data }));
      return;
    }
    const p = prompt("Re-enter master password to save (required to encrypt):");
    if (!p) throw new Error("Password required");
    const saltB64 = getSaltB64() || bufToBase64(crypto.getRandomValues(new Uint8Array(16)).buffer);
    const derivedKey = await deriveKey(p, base64ToBuf(saltB64));
    const cipher = await encryptData(derivedKey, JSON.stringify(dataObj));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ salt: saltB64, iv: cipher.iv, data: cipher.data }));
  };

  const saveEntry = async (entry: VaultEntry) => {
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    try { await persistWithKey(masterKey, newEntries); } catch (e) { console.error(e); alert("Failed to persist entry."); }
  };
  const updateEntry = async (entry: VaultEntry) => {
    const updated = entries.map((e) => (e.id === entry.id ? { ...entry, updatedAt: new Date().toISOString() } : e));
    setEntries(updated);
    try { await persistWithKey(masterKey, updated); } catch (e) { console.error(e); alert("Failed to persist update."); }
  };
  const deleteEntry = async (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    try { await persistWithKey(masterKey, updated); } catch (e) { console.error(e); alert("Failed to persist delete."); }
  };

  const exportVault = () => localStorage.getItem(STORAGE_KEY) || "";
  const importVault = (payload: string) => { try { JSON.parse(payload); localStorage.setItem(STORAGE_KEY, payload); alert("Imported vault. Unlock to access."); } catch { alert("Invalid payload"); } };

  return {
    lock,
    unlocked: !lock,
    unlock,
    lockVault,
    resetVault,
    entries,
    saveEntry,
    updateEntry,
    deleteEntry,
    exportVault,
    importVault,
    // auth
    user,
    register,
    login,
    logoutUser,
  };
}