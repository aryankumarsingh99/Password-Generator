"use client";
import React from "react";
import { VaultEntry } from "../types";
import PasswordItem from "./PasswordItem";

export default function PasswordList({
  entries,
  onEdit,
  onDelete,
  onUpdate,
}: {
  entries: VaultEntry[];
  onEdit: (entry: VaultEntry) => void;
  onDelete: (id: string) => void;
  onUpdate: (entry: VaultEntry) => void;
}) {
  if (!entries || entries.length === 0) {
    return <div className="text-sm text-slate-400">No saved entries</div>;
  }

  return (
    <section className="w-full space-y-3" aria-label="Saved password entries" role="list">
      {entries.map((e) => (
        <PasswordItem
          key={e.id ?? Math.random().toString(36).slice(2)}
          entry={e}
          onEdit={() => onEdit(e)}
          onDelete={() => onDelete(e.id)}
          onUpdate={onUpdate}
        />
      ))}
    </section>
  );
}