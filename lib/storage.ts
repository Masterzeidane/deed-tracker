import { AppData, Deed, DayRecord } from "./types";

const STORAGE_KEY = "deed-tracker-data";

export function loadData(): AppData {
  if (typeof window === "undefined") return emptyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    return JSON.parse(raw) as AppData;
  } catch {
    return emptyData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emptyData(): AppData {
  return { days: {}, streak: 0, lastActiveDate: "" };
}

export function getDayRecord(data: AppData, date: string): DayRecord {
  return data.days[date] ?? { date, deeds: [] };
}

export function upsertDeed(data: AppData, deed: Deed): AppData {
  const day = getDayRecord(data, deed.date);
  const existing = day.deeds.findIndex((d) => d.id === deed.id);
  const deeds =
    existing >= 0
      ? day.deeds.map((d) => (d.id === deed.id ? deed : d))
      : [...day.deeds, deed];
  return {
    ...data,
    days: { ...data.days, [deed.date]: { ...day, deeds } },
  };
}

export function deleteDeed(data: AppData, deedId: string, date: string): AppData {
  const day = getDayRecord(data, date);
  const deeds = day.deeds.filter((d) => d.id !== deedId);
  return {
    ...data,
    days: { ...data.days, [date]: { ...day, deeds } },
  };
}

export function computeStreak(data: AppData, today: string): number {
  let streak = 0;
  let cursor = today;
  while (true) {
    const day = data.days[cursor];
    if (!day || day.deeds.length === 0 || day.deeds.every((d) => !d.completed)) break;
    streak++;
    cursor = offsetDate(cursor, -1);
  }
  return streak;
}

function offsetDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
