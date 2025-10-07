"use client";
import React, { useEffect, useState } from "react";
import { VaultEntry } from "../types";

export default function PasswordEntryForm({
  initialPassword,
  onClose,
  onSave,
}: {
  initialPassword?: string;
  onClose: () => void;
  onSave: (entry: VaultEntry) => void;
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [password, setPassword] = useState(initialPassword || "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const temp = (document.getElementById("entry-password-temp") as HTMLElement | null)?.getAttribute("data-temp");
    if (temp && !password) setPassword(temp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Title required");
      return;
    }
    const entry: VaultEntry = {
      id: crypto.randomUUID(),
      name: name.trim(),
      username: username.trim(),
      url: url.trim(),
      notes: notes.trim(),
      password,
      createdAt: new Date().toISOString(),
    };
    onSave(entry);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text || "");
      alert("Password copied");
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex p-4 items-end sm:items-center justify-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 text-slate-50 rounded-t-xl sm:rounded-xl shadow-xl overflow-auto max-h-[92vh]">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Save entry</h3>
            <p className="text-sm text-slate-400 mt-1">Encrypted locally with your master password</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-700/40">Close</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
          <div>
            <label className="text-sm text-slate-300 block mb-1">Title</label>
            <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gmail" autoFocus required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 block mb-1">Username</label>
              <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username or email" />
            </div>

            <div>
              <label className="text-sm text-slate-300 block mb-1">URL</label>
              <input className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Password</label>
            <div className="flex gap-3 items-center flex-wrap">
              <input id="entry-password-temp" className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 font-mono" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Use generator or type a password" />
              <div className="flex gap-2">
                <button type="button" onClick={async () => { await copyToClipboard(password); }} className="text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-700/40">Copy</button>
                <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-sm px-3 py-2 rounded-lg border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-700/40">{showPassword ? "Hide" : "Show"}</button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-300 block mb-1">Notes</label>
            <textarea className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
          </div>

          <div className="flex gap-3 justify-end flex-wrap">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-700/40">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white">Save entry</button>
          </div>
        </form>
      </div>
    </div>
  );
}