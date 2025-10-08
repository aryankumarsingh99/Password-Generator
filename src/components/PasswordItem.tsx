"use client";
import React from "react";
import { VaultEntry } from "../types";

export default function PasswordItem({ entry, onEdit, onDelete }: { entry: VaultEntry; onEdit?: () => void; onDelete?: () => void; }) {
  return (
    <article className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-800 dark:text-slate-50">{entry.title ?? entry.name ?? "Untitled"}</h4>
          {entry.url && <span className="text-xs text-slate-400 dark:text-slate-300 ml-2">{entry.url}</span>}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-300">{entry.username}</div>
      </div>

      <div className="flex items-center gap-2 ml-4">
        <button onClick={onEdit} className="px-3 py-1 rounded-md text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-50">Edit</button>
        <button onClick={onDelete} className="px-3 py-1 rounded-md text-sm bg-rose-50 dark:bg-rose-900 border border-rose-100 dark:border-rose-700 text-rose-600 dark:text-rose-300">Delete</button>
      </div>
    </article>
  );
}