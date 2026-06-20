"use client";
import { useState } from "react";
import { Deed } from "@/lib/types";
import { CATEGORY_META } from "@/lib/utils";

interface Props {
  deed: Deed;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function DeedItem({ deed, onToggle, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const meta = CATEGORY_META[deed.category];

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all ${
        deed.completed
          ? "bg-gray-50 border-gray-100 opacity-70"
          : "bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          deed.completed
            ? "bg-indigo-500 border-indigo-500"
            : "border-gray-300 hover:border-indigo-400"
        }`}
        aria-label={deed.completed ? "Mark incomplete" : "Mark complete"}
      >
        {deed.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${deed.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
          {deed.title}
        </p>
        {deed.description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{deed.description}</p>
        )}
        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full border ${meta.color}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <>
            <button
              onClick={() => { onDelete(); setConfirmDelete(false); }}
              className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"
            >
              No
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                <path d="M3 4h10M6 4V3h4v1M5 4v8h6V4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
