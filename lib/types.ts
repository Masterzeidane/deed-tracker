export type DeedCategory = "health" | "work" | "personal" | "social" | "learning" | "other";

export interface Deed {
  id: string;
  title: string;
  description?: string;
  category: DeedCategory;
  completed: boolean;
  createdAt: string; // ISO date string
  completedAt?: string; // ISO date string
  date: string; // YYYY-MM-DD — the day this deed belongs to
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  deeds: Deed[];
}

export interface AppData {
  days: Record<string, DayRecord>; // keyed by YYYY-MM-DD
  streak: number;
  lastActiveDate: string;
}
