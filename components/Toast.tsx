"use client";
import { useEffect } from "react";

export type ToastType = "error" | "success" | "info";

interface Props {
  message: string;
  type?: ToastType;
  onClose: () => void;
  durationMs?: number;
}

const STYLES: Record<ToastType, string> = {
  error:   "bg-red-600 text-white",
  success: "bg-emerald-600 text-white",
  info:    "bg-gray-800 text-white",
};

const ICONS: Record<ToastType, string> = {
  error:   "✕",
  success: "✓",
  info:    "ℹ",
};

export default function Toast({ message, type = "error", onClose, durationMs = 4000 }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [message, onClose, durationMs]);

  return (
    <div
      role="alert"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-sm w-[calc(100%-2rem)] animate-in fade-in slide-in-from-bottom-2 ${STYLES[type]}`}
    >
      <span className="text-base leading-none">{ICONS[type]}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="opacity-70 hover:opacity-100 transition-opacity text-xs leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
