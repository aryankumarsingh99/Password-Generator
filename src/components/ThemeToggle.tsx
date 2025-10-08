"use client";

import React, { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const s = localStorage.getItem("pv_theme");
    if (s) return s === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });

  useEffect(() => {
    const el = document.documentElement;
    if (dark) el.classList.add("dark");
    else el.classList.remove("dark");
    localStorage.setItem("pv_theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      aria-pressed={dark}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-50 border border-slate-200 dark:border-slate-600 shadow-sm hover:scale-[1.02] transition"
      title={dark ? "Switch to light" : "Switch to dark"}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
        {dark ? (
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
        ) : (
          <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span>{dark ? "Dark" : "Light"}</span>
    </button>
  );
}