"use client";
import React, { useEffect, useState } from "react";
import PasswordGenerator from "./PasswordGenerator";
import PasswordList from "./PasswordList";
import PasswordEntryForm from "./PasswordEntryForm";
import AuthForm from "./AuthForm";
import { VaultEntry } from "../types";
import { deriveKeyFromPassword, encryptEntryObject, decryptEntryObject, exportEncryptedEntries, importEncryptedFile } from "../lib/cryptoClient";
import ThemeToggle from "@/components/ThemeToggle";

const API_BASE = "/api";

export default function VaultPanel() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("pv_token");
  });
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [savingPassword, setSavingPassword] = useState<string | undefined>(undefined);

  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!token) {
      setEntries([]);
      setMasterKey(null);
      return;
    }
    setUnlocking(true);
  }, [token]);

  async function onUnlockSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!token) return;
    try {
      const key = await deriveKeyFromPassword(masterPassword || "", token);
      setMasterKey(key);
      setUnlocking(false);
      setMasterPassword("");
      await fetchEntries(key);
    } catch {
      alert("Unlock failed — try a different master password");
    }
  }

  async function fetchEntries(keyProvided?: CryptoKey | null) {
    if (!token) return;
    const key = keyProvided ?? masterKey;
    const res = await fetch(`${API_BASE}/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem("pv_token");
      setToken(null);
      return;
    }
    if (!res.ok) {
      console.error("Fetch entries failed", await res.text());
      return;
    }
    const data = await res.json();
    if (!key) {
      // show encrypted blobs as-is if no key
      setEntries(data.map((d: any) => ({ id: d._id || d.id, title: d.title || "", username: d.username || "", password: d.password || "", url: d.url || "", notes: d.notes || "" })));
      return;
    }

    const out: VaultEntry[] = [];
    for (const doc of data) {
      try {
        const dec = await decryptEntryObject(doc, key);
        out.push({
          id: dec.id || (doc._id ? String(doc._id) : ""),
          title: dec.title || doc.title || "",
          username: dec.username || "",
          password: dec.password || "",
          url: dec.url || "",
          notes: dec.notes || "",
        });
      } catch (err) {
        // skip or include a placeholder
        out.push({
          id: doc._id ? String(doc._id) : doc.id || Math.random().toString(36).slice(2),
          title: doc.title || "Encrypted item",
          username: "",
          password: "",
          url: "",
          notes: "",
        });
      }
    }
    setEntries(out);
  }

  async function handleSaveEntry(entry: VaultEntry) {
    if (!token) return alert("Login required");
    if (!masterKey) return alert("Unlock your vault first");

    const payload = await encryptEntryObject({
      title: entry.title ?? entry.name ?? "",
      username: entry.username ?? "",
      password: entry.password ?? "",
      url: entry.url ?? "",
      notes: entry.notes ?? "",
    }, masterKey);

    const res = await fetch(`${API_BASE}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Save failed");
      return;
    }
    await fetchEntries();
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!token) return alert("Login required");
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`${API_BASE}/entries/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    await fetchEntries();
  }

  function handleEdit(entry: VaultEntry) {
    setSavingPassword(entry.password);
    setShowForm(true);
  }

  async function handleExportAll() {
    if (!token) return alert("Login required");
    const res = await fetch("/api/entries", { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return alert("Export failed");
    const data = await res.json();
    const blob = exportEncryptedEntries(data);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vault-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(file: File) {
    if (!token) return alert("Login required");
    const docs = await importEncryptedFile(file);
    // simple merge: POST each doc to entries API (server stores them as-is)
    for (const d of docs) {
      await fetch("/api/entries", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(d) });
    }
    await fetchEntries();
  }

  if (!token) {
    return (
      <div className="p-4 bg-slate-800 rounded">
        <h3 className="mb-3 text-lg">Sign in</h3>
        <AuthForm onAuth={(t) => { localStorage.setItem("pv_token", t); setToken(t); }} />
      </div>
    );
  }

  if (unlocking) {
    return (
      <div className="p-4 bg-slate-800 rounded max-w-md">
        <h3 className="mb-3 text-lg">Unlock your vault</h3>
        <form onSubmit={onUnlockSubmit} className="space-y-2">
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700"
            placeholder="Master password (never stored)"
            required
            autoFocus
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded bg-emerald-600 text-white" type="submit">Unlock</button>
            <button className="px-4 py-2 rounded bg-rose-600 text-white" type="button" onClick={() => { localStorage.removeItem("pv_token"); setToken(null); }}>Logout</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      <div className="mb-4 flex gap-2 items-start">
        <div className="flex-1">
          <PasswordGenerator onSave={(p) => { setSavingPassword(p); setShowForm(true); }} />
        </div>

        <div className="flex flex-col gap-2 w-44">
          <ThemeToggle />
          <button
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm flex items-center justify-center gap-2"
            onClick={() => {
              localStorage.removeItem("pv_token");
              setToken(null);
            }}
            aria-label="Logout"
          >
            Logout
          </button>

          <input
            type="text"
            aria-label="Search entries"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200"
          />
        </div>
      </div>

      <PasswordList
        entries={entries.filter((en) => {
          const q = searchQuery.trim().toLowerCase();
          if (!q) return true;
          const title = (en.title ?? en.name ?? "").toString().toLowerCase();
          const username = (en.username ?? "").toString().toLowerCase();
          const url = (en.url ?? "").toString().toLowerCase();
          const notes = (en.notes ?? "").toString().toLowerCase();
          return title.includes(q) || username.includes(q) || url.includes(q) || notes.includes(q);
        })}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdate={() => {}}
      />

      {showForm && (
        <PasswordEntryForm
          initialPassword={savingPassword}
          onClose={() => { setShowForm(false); setSavingPassword(undefined); }}
          onSave={handleSaveEntry}
        />
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="file"
          accept="application/json"
          onChange={e => e.target.files?.[0] && handleImportFile(e.target.files[0])}
          className="px-3 py-2 rounded bg-slate-900 border border-slate-700 text-slate-200"
          aria-label="Import encrypted file"
        />
        <button
          onClick={handleExportAll}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white"
          type="button"
        >
          Export (encrypted)
        </button>
      </div>
    </div>
  );
}