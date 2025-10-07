"use client";
import React, { useEffect, useState } from "react";

type Props = { onSave?: (password: string) => void };

const CHARSETS = {
  lower: "abcdefghijkmnopqrstuvwxyz",
  upper: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  numbers: "23456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
};
const LOOK_ALIKE = "ilLIoO0";

export default function PasswordGenerator({ onSave }: Props) {
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(false);
  const [excludeLookAlikes, setExcludeLookAlikes] = useState(true);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const t = setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
        } catch {}
        setCopied(false);
      }, 15000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  const getRandomValues = (n: number) => {
    const arr = new Uint8Array(n);
    crypto.getRandomValues(arr);
    return arr;
  };

  const buildCharset = () => {
    let set = "";
    if (useLower) set += CHARSETS.lower;
    if (useUpper) set += CHARSETS.upper;
    if (useNumbers) set += CHARSETS.numbers;
    if (useSymbols) set += CHARSETS.symbols;
    if (excludeLookAlikes) set = set.split("").filter((c) => !LOOK_ALIKE.includes(c)).join("");
    return set;
  };

  const generate = () => {
    const set = buildCharset();
    if (!set) return;
    const rnd = getRandomValues(length);
    let out = "";
    for (let i = 0; i < length; i++) out += set[rnd[i] % set.length];
    setPassword(out);
  };

  const copyNow = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 space-y-6">
      {/* generated password + actions (wider) */}
      <div className="w-full flex flex-col lg:flex-row items-stretch gap-4">
        <div className="min-w-0 flex-1">
          <input
            aria-label="Generated password"
            className="w-full font-mono text-lg md:text-xl px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-50 truncate"
            value={password}
            readOnly
            placeholder="Generated password"
          />
        </div>

        <div className="flex-shrink-0 flex items-stretch gap-3">
          <button
            type="button"
            onClick={copyNow}
            className="flex-none px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            aria-live="polite"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="1.5" />
              <rect x="2" y="2" width="13" height="13" rx="2" strokeWidth="1.5" />
            </svg>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSave?.(password)}
            className="flex-none px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path d="M12 5v14" strokeWidth="1.8" />
              <path d="M5 12h14" strokeWidth="1.8" />
            </svg>
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* slider (wider) */}
      <div className="w-full flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <label className="text-sm text-slate-300">Length</label>
          <div className="text-sm bg-slate-800 px-3 py-1 rounded text-slate-200">{length}</div>
        </div>

        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-indigo-500"
            aria-label="Password length"
          />
        </div>
      </div>

      {/* options + generate (wider grid) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 items-start">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <label className="inline-flex items-center gap-2 text-sm select-none">
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300">Lower</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm select-none">
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300">Upper</span>
          </label>

          <label className="inline-flex items-center gap-2 text-sm select-none">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300">Numbers</span>
          </label>

          <label className="inline-flex items-center gap-1 text-sm select-none">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300">Symbol</span>
          </label>

          <label className="inline-flex items-center gap-4 text-sm select-none ml-4 md:ml-0">
            <input type="checkbox" checked={excludeLookAlikes} onChange={(e) => setExcludeLookAlikes(e.target.checked)} className="w-4 h-4" />
            <span className="text-slate-300">Exclude look‑alikes</span>
          </label>
        </div>

        {/* shift this column left to simulate a negative gap */}
        <div className="flex items-center lg:justify-end md:-translate-x-4 md:-ml-0">
          <button
            type="button"
            onClick={generate}
            className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm w-full md:w-auto"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}