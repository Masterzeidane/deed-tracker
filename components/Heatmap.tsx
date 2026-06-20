"use client";
import { AppData } from "@/lib/types";
import { today } from "@/lib/utils";

interface Props {
  data: AppData;
}

function buildGrid() {
  const t = new Date(today() + "T00:00:00");
  // End on Saturday of the current week
  const dayOfWeek = t.getDay(); // 0=Sun
  const daysToSaturday = 6 - dayOfWeek;
  const end = new Date(t);
  end.setDate(end.getDate() + daysToSaturday);

  const WEEKS = 16;
  const cells: string[] = [];
  const start = new Date(end);
  start.setDate(end.getDate() - WEEKS * 7 + 1);

  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d.toISOString().slice(0, 10));
  }
  return cells;
}

function getMonthLabels(cells: string[]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  cells.forEach((date, i) => {
    const month = new Date(date + "T00:00:00").getMonth();
    if (month !== lastMonth) {
      labels.push({ label: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short" }), col: Math.floor(i / 7) });
      lastMonth = month;
    }
  });
  return labels;
}

function intensity(total: number, done: number): 0 | 1 | 2 | 3 | 4 {
  if (total === 0) return 0;
  const rate = done / total;
  if (rate === 0) return 1;
  if (rate < 0.4) return 2;
  if (rate < 1) return 3;
  return 4;
}

const COLORS = [
  "bg-gray-100",           // 0 — no data
  "bg-indigo-100",         // 1 — has deeds, none done
  "bg-indigo-300",         // 2 — < 40%
  "bg-indigo-400",         // 3 — < 100%
  "bg-indigo-600",         // 4 — 100%
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Heatmap({ data }: Props) {
  const cells = buildGrid();
  const todayStr = today();
  const monthLabels = getMonthLabels(cells);

  // Group into columns (weeks)
  const weeks: string[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity — last 16 weeks</p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {weeks.map((_, wi) => {
              const label = monthLabels.find((m) => m.col === wi);
              return (
                <div key={wi} className="w-4 mr-0.5 text-[9px] text-gray-400 flex-shrink-0">
                  {label?.label ?? ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((d, i) => (
                <div key={d} className={`h-4 text-[9px] text-gray-400 flex items-center ${i % 2 === 1 ? "" : "opacity-0"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((date) => {
                  const day = data.days[date];
                  const total = day?.deeds.length ?? 0;
                  const done = day?.deeds.filter((d) => d.completed).length ?? 0;
                  const level = intensity(total, done);
                  const isToday = date === todayStr;
                  const isFuture = date > todayStr;

                  return (
                    <div
                      key={date}
                      title={`${date}: ${done}/${total} completed`}
                      className={`w-4 h-4 rounded-sm flex-shrink-0 transition-colors ${
                        isFuture ? "bg-gray-50" : COLORS[level]
                      } ${isToday ? "ring-1 ring-indigo-600 ring-offset-1" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-gray-400">Less</span>
            {COLORS.map((c, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
            ))}
            <span className="text-[10px] text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
