"use client";
import React, { useEffect, useRef, useState } from "react";
import { VaultEntry } from "../types";

export default function PasswordItem({
  entry,
  onEdit,
  onDelete,
  onUpdate,
}: {
  entry: VaultEntry;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (e: VaultEntry) => void;
}) {
  // normalize title/name to avoid undefined errors
  const displayTitleRaw = (entry as any).title ?? (entry as any).name ?? "Untitled";
  const displayTitle = typeof displayTitleRaw === "string" ? displayTitleRaw : String(displayTitleRaw ?? "");
  const initials = displayTitle.substring(0, 2).toUpperCase();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (ev: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(ev.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(entry.password);
      setCopied(true);
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText("");
        } catch {}
        setCopied(false);
      }, 15000);
    } catch {
      alert("Copy failed");
    }
  };

  return (
    <article
      role="listitem"
      aria-label={displayTitle}
      className="w-full flex-1 bg-white dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-md p-2 flex flex-col sm:flex-row sm:items-center gap-2"
    >
      <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-white font-semibold text-sm"
          style={{ background: "linear-gradient(90deg,#7c3aed,#06b6d4)" }}
          aria-hidden
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{displayTitle}</div>
          <div className="text-xs text-slate-400 flex items-center gap-2 truncate">
            <span className="truncate">{entry.username || "—"}</span>
            <span className="hidden sm:inline">•</span>
            <span className="truncate text-slate-400">{entry.url || ""}</span>
          </div>
          {entry.notes && <div className="mt-1 text-xs text-slate-400 line-clamp-2 truncate">{entry.notes}</div>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="font-mono text-sm bg-slate-900/60 px-3 py-2 rounded-md text-center truncate min-w-[120px] md:min-w-[160px]" title={show ? entry.password : ""}>
          {show ? entry.password : "•".repeat(12)}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={copyPassword} className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm" aria-label="Copy password">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="1.5" />
              <rect x="2" y="2" width="13" height="13" rx="2" strokeWidth="1.5" />
            </svg>
            <span className="hidden md:inline">{copied ? "Copied" : "Copy"}</span>
          </button>

          <button onClick={() => setShow((s) => !s)} className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-700 hover:bg-slate-600 text-white text-xs md:text-sm" aria-pressed={show} aria-label={show ? "Hide password" : "Show password"}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
            </svg>
            <span className="hidden md:inline">{show ? "Hide" : "Show"}</span>
          </button>

          <div className="relative" ref={menuRef}>
            <div className="hidden md:flex gap-2">
              <button onClick={onEdit} className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm">Edit</button>
              <button onClick={() => { if (confirm("Delete entry?")) onDelete(); }} className="px-2 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-sm">Delete</button>
            </div>

            <button onClick={() => setMenuOpen((s) => !s)} className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-md bg-slate-700 hover:bg-slate-600 text-white" aria-expanded={menuOpen} aria-label="Open actions">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                <button onClick={() => { setMenuOpen(false); onEdit(); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700">Edit</button>
                <button onClick={() => { setMenuOpen(false); if (confirm("Delete entry?")) onDelete(); }} className="w-full text-left px-3 py-2 text-sm text-rose-400 hover:bg-slate-700">Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}