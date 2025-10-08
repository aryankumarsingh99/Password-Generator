"use client";
import React, { useState } from "react";

type Props = { onSave?: (password: string) => void };

export default function PasswordGenerator({ onSave }: Props) {
  const [len, setLen] = useState(16);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [pwd, setPwd] = useState("");

  function generate() {
    const lowerSet = "abcdefghijklmnopqrstuvwxyz";
    const upperSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numSet = "0123456789";
    const symSet = "!@#$%^&*-_+=";
    let chars = lowerSet + (upper ? upperSet : "") + (numbers ? numSet : "") + (symbols ? symSet : "");
    if (!chars) return;
    let out = "";
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    setPwd(out);
  }

  return (
    <div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Length: {len}</label>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-50" onClick={() => { setLen((l) => Math.max(8, l - 1)); }}>-</button>
            <button className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-50" onClick={() => { setLen((l) => Math.min(64, l + 1)); }}>+</button>
          </div>
        </div>

        <input type="range" min={8} max={64} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full" />

        <div className="grid grid-cols-2 gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={upper} onChange={() => setUpper((s) => !s)} className="form-checkbox" />
            Uppercase
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={numbers} onChange={() => setNumbers((s) => !s)} className="form-checkbox" />
            Numbers
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={symbols} onChange={() => setSymbols((s) => !s)} className="form-checkbox" />
            Symbols
          </label>
          <div />
        </div>

        <div className="flex items-center gap-2">
          <input readOnly value={pwd} className="flex-1 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50" />
          <button onClick={generate} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">Generate</button>
          <button onClick={() => { navigator.clipboard.writeText(pwd); onSave?.(pwd); }} className="px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-50">Save</button>
        </div>
      </div>
    </div>
  );
}