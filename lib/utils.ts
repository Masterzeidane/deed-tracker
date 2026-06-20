import { DeedCategory } from "./types";

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function nanoid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const CATEGORY_META: Record<DeedCategory, { label: string; color: string; emoji: string }> = {
  health:   { label: "Health",   color: "bg-green-100 text-green-700 border-green-200",   emoji: "💪" },
  work:     { label: "Work",     color: "bg-blue-100 text-blue-700 border-blue-200",       emoji: "💼" },
  personal: { label: "Personal", color: "bg-purple-100 text-purple-700 border-purple-200", emoji: "🌟" },
  social:   { label: "Social",   color: "bg-yellow-100 text-yellow-700 border-yellow-200", emoji: "🤝" },
  learning: { label: "Learning", color: "bg-orange-100 text-orange-700 border-orange-200", emoji: "📚" },
  other:    { label: "Other",    color: "bg-gray-100 text-gray-600 border-gray-200",        emoji: "📌" },
};

export function completionRate(total: number, done: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
