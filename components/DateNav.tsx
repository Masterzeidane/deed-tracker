"use client";
import { formatDate, today } from "@/lib/utils";

interface Props {
  date: string;
  onChange: (date: string) => void;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function DateNav({ date, onChange }: Props) {
  const isToday = date === today();

  return (
    <div className="flex items-center justify-between gap-2">
      <button
        onClick={() => onChange(offsetDate(date, -1))}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-sm"
        aria-label="Previous day"
      >
        ‹
      </button>

      <div className="text-center flex-1">
        <p className="text-sm font-semibold text-gray-800">{formatDate(date)}</p>
        {isToday && (
          <span className="text-xs text-indigo-600 font-medium">Today</span>
        )}
      </div>

      <button
        onClick={() => onChange(offsetDate(date, 1))}
        disabled={isToday}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
        aria-label="Next day"
      >
        ›
      </button>
    </div>
  );
}
