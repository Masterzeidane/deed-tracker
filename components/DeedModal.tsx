"use client";
import { useEffect, useRef, useState } from "react";
import { Deed, DeedCategory } from "@/lib/types";
import { CATEGORY_META, today } from "@/lib/utils";

interface Props {
  open: boolean;
  date: string;
  initial?: Deed;
  onClose: () => void;
  onSave: (deed: Omit<Deed, "id" | "createdAt" | "completed" | "completedAt"> | Deed) => void;
}

const CATEGORIES = Object.entries(CATEGORY_META) as [DeedCategory, (typeof CATEGORY_META)[DeedCategory]][];

export default function DeedModal({ open, date, initial, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DeedCategory>("personal");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setDescription(initial?.description ?? "");
      setCategory(initial?.category ?? "personal");
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, initial]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (initial) {
      onSave({ ...initial, title: title.trim(), description: description.trim() || undefined, category });
    } else {
      onSave({ title: title.trim(), description: description.trim() || undefined, category, date });
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-lg">
            {initial ? "Edit deed" : "Add a deed"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you do (or plan to do)?"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    category === key
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {initial ? "Save changes" : "Add deed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
