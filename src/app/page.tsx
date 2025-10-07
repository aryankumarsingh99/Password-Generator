"use client";

import React from "react";
import VaultPanel from "../components/VaultPanel";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-6 space-y-6">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
              PV
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                Password Vault
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Generate, save and manage passwords locally.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <section className="w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
            <VaultPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
