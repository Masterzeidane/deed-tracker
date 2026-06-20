"use client";
import { AppData, DeedCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/utils";

interface Props {
  data: AppData;
}

const DONUT_COLORS: Record<DeedCategory, string> = {
  health:   "#22c55e",
  work:     "#3b82f6",
  personal: "#a855f7",
  social:   "#eab308",
  learning: "#f97316",
  other:    "#9ca3af",
};

export default function CategoryChart({ data }: Props) {
  const allDeeds = Object.values(data.days).flatMap((d) => d.deeds);

  const counts = Object.keys(CATEGORY_META).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = allDeeds.filter((d) => d.category === cat).length;
    return acc;
  }, {});

  const total = allDeeds.length;

  if (total === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">By category</p>
        <p className="text-sm text-gray-400 text-center py-6">No deeds yet</p>
      </div>
    );
  }

  // Build SVG donut arcs
  const RADIUS = 40;
  const CX = 60;
  const CY = 60;
  const STROKE = 18;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const segments: { cat: DeedCategory; count: number; color: string; offset: number; dash: number }[] = [];
  let cumulative = 0;

  (Object.entries(counts) as [DeedCategory, number][])
    .filter(([, c]) => c > 0)
    .forEach(([cat, count]) => {
      const fraction = count / total;
      segments.push({
        cat,
        count,
        color: DONUT_COLORS[cat],
        offset: CIRCUMFERENCE * (1 - cumulative),
        dash: CIRCUMFERENCE * fraction,
      });
      cumulative += fraction;
    });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">By category</p>

      <div className="flex items-center gap-4">
        {/* SVG Donut */}
        <div className="flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle cx={CX} cy={CY} r={RADIUS} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
            {segments.map((seg, i) => (
              <circle
                key={seg.cat}
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.dash} ${CIRCUMFERENCE - seg.dash}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ transition: "stroke-dasharray 0.5s ease" }}
              />
            ))}
            <text x={CX} y={CY - 6} textAnchor="middle" className="text-xs" fontSize="18" fontWeight="700" fill="#1f2937">
              {total}
            </text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="9" fill="#9ca3af">
              total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 min-w-0">
          {(Object.entries(counts) as [DeedCategory, number][])
            .filter(([, c]) => c > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => {
              const meta = CATEGORY_META[cat];
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: DONUT_COLORS[cat] }} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{meta.emoji} {meta.label}</span>
                  <span className="text-xs font-semibold text-gray-800">{pct}%</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
