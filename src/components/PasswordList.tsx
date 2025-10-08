"use client";
import React from "react";
import PasswordItem from "./PasswordItem";
import { VaultEntry } from "../types";

export default function PasswordList({
  entries = [],
  onEdit,
  onDelete,
  searchQuery = "",
}: {
  entries?: VaultEntry[];
  onEdit?: (e: VaultEntry) => void;
  onDelete?: (id: string) => void;
  searchQuery?: string;
}) {
  const filtered = (entries || []).filter((en) => {
    const q = (searchQuery || "").trim().toLowerCase();
    if (!q) return true;
    return ((en.title ?? en.name ?? "").toLowerCase().includes(q) ||
      (en.username ?? "").toLowerCase().includes(q) ||
      (en.url ?? "").toLowerCase().includes(q));
  });

  if (!filtered.length) return <div className="text-sm text-slate-500 dark:text-slate-300">No entries found</div>;

  return (
    <div className="space-y-3 mt-3">
      {filtered.map((e) => {
        const keyId = String((e as any).id ?? (e as any)._id ?? JSON.stringify(e));
        const idForDelete = String((e as any).id ?? (e as any)._id ?? "");
        return (
          <PasswordItem
            key={keyId}
            entry={e}
            onEdit={() => onEdit?.(e as any)}
            onDelete={() => onDelete?.(idForDelete)}
          />
        );
      })}
    </div>
  );
}