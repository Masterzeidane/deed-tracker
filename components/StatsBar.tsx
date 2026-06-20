"use client";
import { AppData } from "@/lib/types";
import { completionRate, today } from "@/lib/utils";

interface Props {
  data: AppData;
  streak: number;
}

export default function StatsBar({ data, streak }: Props) {
  // Last 7 days stats
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const weekStats = days.map((date) => {
    const day = data.days[date];
    const total = day?.deeds.length ?? 0;
    const done = day?.deeds.filter((d) => d.completed).length ?? 0;
    return { date, total, done, rate: completionRate(total, done) };
  });

  const todayKey = today();
  const todayDay = data.days[todayKey];
  const todayTotal = todayDay?.deeds.length ?? 0;
  const todayDone = todayDay?.deeds.filter((d) => d.completed).length ?? 0;
  const todayRate = completionRate(todayTotal, todayDone);

  const allDeeds = Object.values(data.days).flatMap((d) => d.deeds);
  const totalEver = allDeeds.length;
  const doneEver = allDeeds.filter((d) => d.completed).length;

  return (
    <div className="space-y-4">
      {/* Top stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Streak"
          value={`${streak}`}
          sub={streak === 1 ? "day" : "days"}
          icon="🔥"
          highlight={streak > 0}
        />
        <StatCard
          label="Today"
          value={`${todayDone}/${todayTotal}`}
          sub={`${todayRate}% done`}
          icon="✅"
          highlight={todayRate === 100 && todayTotal > 0}
        />
        <StatCard
          label="All time"
          value={`${doneEver}`}
          sub={`of ${totalEver} deeds`}
          icon="📊"
        />
      </div>

      {/* 7-day bar chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <p className="text-xs font-medium text-gray-500 mb-3">Last 7 days</p>
        <div className="flex items-end gap-1.5 h-16">
          {weekStats.map(({ date, total, done, rate }) => {
            const isToday = date === todayKey;
            const label = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
            return (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-12 relative">
                  {total === 0 ? (
                    <div className="w-full h-1 rounded-full bg-gray-100" />
                  ) : (
                    <>
                      <div className="w-full rounded-t-sm bg-gray-100" style={{ height: "100%" }} />
                      <div
                        className={`absolute bottom-0 w-full rounded-sm transition-all ${
                          rate === 100 ? "bg-indigo-500" : rate > 0 ? "bg-indigo-300" : "bg-gray-200"
                        }`}
                        style={{ height: `${Math.max(rate, 8)}%` }}
                      />
                    </>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isToday ? "text-indigo-600" : "text-gray-400"}`}>
                  {isToday ? "Today" : label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3 border ${highlight ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-200"}`}>
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={`text-lg font-bold leading-none ${highlight ? "text-indigo-700" : "text-gray-800"}`}>{value}</div>
      <div className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-[10px] text-gray-400">{sub}</div>
    </div>
  );
}
