import { DeedCategory } from "./types";

export interface BranchMeta {
  label: string;
  fullLabel: string;
  emoji: string;
  gradient: string;
  ring: string;
}

export const BRANCH_META: Record<DeedCategory, BranchMeta> = {
  health: {
    label: "Body",
    fullLabel: "Body & Health",
    emoji: "💪",
    gradient: "from-emerald-400 to-teal-500",
    ring: "ring-emerald-400",
  },
  work: {
    label: "Craft",
    fullLabel: "Work & Craft",
    emoji: "⚒️",
    gradient: "from-blue-400 to-indigo-500",
    ring: "ring-blue-400",
  },
  personal: {
    label: "Growth",
    fullLabel: "Inner Growth",
    emoji: "🌱",
    gradient: "from-violet-400 to-purple-500",
    ring: "ring-violet-400",
  },
  social: {
    label: "People",
    fullLabel: "Relationships",
    emoji: "🤝",
    gradient: "from-amber-400 to-orange-500",
    ring: "ring-amber-400",
  },
  learning: {
    label: "Mind",
    fullLabel: "Learning & Mind",
    emoji: "📚",
    gradient: "from-cyan-400 to-sky-500",
    ring: "ring-cyan-400",
  },
  other: {
    label: "Spirit",
    fullLabel: "Spirit & Purpose",
    emoji: "✨",
    gradient: "from-rose-400 to-pink-500",
    ring: "ring-rose-400",
  },
};
