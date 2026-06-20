import { AppData, DeedCategory } from "./types";

// XP thresholds per level (cumulative)
const XP_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1050, 1400, 1800, 2250, 2750, 3300, 3900, 4550, 5250, 6000, 6800, 7650, 8550, 9500];

export function computeTotalXP(data: AppData): number {
  return Object.values(data.days)
    .flatMap((d) => d.deeds)
    .filter((d) => d.completed)
    .length * 10;
}

export function computeLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForCurrentLevel(level: number): number {
  return XP_THRESHOLDS[Math.min(level - 1, XP_THRESHOLDS.length - 1)];
}

export function xpForNextLevel(level: number): number {
  return XP_THRESHOLDS[Math.min(level, XP_THRESHOLDS.length - 1)];
}

export function getRank(level: number): string {
  if (level <= 3) return "Seedling";
  if (level <= 6) return "Seeker";
  if (level <= 10) return "Guardian";
  if (level <= 15) return "Sage";
  return "Luminary";
}

export function computeDailyScore(
  data: AppData,
  date: string,
  hasReflection: boolean
): number {
  const day = data.days[date];
  const streakBonus = Math.min(data.streak * 2, 20);
  const reflectionBonus = hasReflection ? 20 : 0;

  if (!day || day.deeds.length === 0) {
    return Math.min(streakBonus + reflectionBonus, 100);
  }

  const completed = day.deeds.filter((d) => d.completed).length;
  const completionScore = Math.round((completed / day.deeds.length) * 60);

  return Math.min(completionScore + streakBonus + reflectionBonus, 100);
}

export function computeWeeklyAverage(data: AppData): number {
  const scores: number[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const day = data.days[dateStr];
    if (day && day.deeds.length > 0) {
      const completed = day.deeds.filter((x) => x.completed).length;
      scores.push(Math.round((completed / day.deeds.length) * 100));
    }
  }
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export interface BranchStat {
  total: number;
  completed: number;
  rate: number | null; // null = no deeds this branch today
}

export function getBranchStats(
  data: AppData,
  date: string
): Record<DeedCategory, BranchStat> {
  const day = data.days[date];
  const categories: DeedCategory[] = ["health", "work", "personal", "social", "learning", "other"];

  return Object.fromEntries(
    categories.map((cat) => {
      const deeds = day?.deeds.filter((d) => d.category === cat) ?? [];
      const completed = deeds.filter((d) => d.completed).length;
      return [
        cat,
        {
          total: deeds.length,
          completed,
          rate: deeds.length > 0 ? completed / deeds.length : null,
        },
      ];
    })
  ) as Record<DeedCategory, BranchStat>;
}

export function getMotivationalMessage(score: number, streak: number): string {
  if (score === 100) return "Perfect day. You set the standard.";
  if (score >= 85) return "Outstanding. You're building something real.";
  if (score >= 70) return "Strong work. Consistency compounds.";
  if (score >= 50) return "Good progress. Keep your momentum.";
  if (score >= 30) return "Every deed matters. Tomorrow, go further.";
  if (streak > 7) return `${streak} days in. Don't break what you've built.`;
  return "The journey starts with one deed. Begin.";
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still going,";
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  if (hour < 21) return "Good evening,";
  return "Good night,";
}
