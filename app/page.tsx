"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDeeds } from "@/hooks/useDeeds";
import { today } from "@/lib/utils";
import AuthForm from "@/components/AuthForm";
import DateNav from "@/components/DateNav";
import DeedList from "@/components/DeedList";
import DeedModal from "@/components/DeedModal";
import StatsBar from "@/components/StatsBar";
import Heatmap from "@/components/Heatmap";
import CategoryChart from "@/components/CategoryChart";
import Celebration from "@/components/Celebration";
import Toast from "@/components/Toast";
import { Deed } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase";

type Tab = "today" | "stats";

export default function Home() {
  if (!isSupabaseConfigured) return <SetupScreen />;

  const { user, loading: authLoading, signOut } = useAuth();

  // Show nothing while resolving session — avoids flash of login screen
  if (authLoading) return <LoadingScreen />;

  // Not signed in — show auth form
  if (!user) return <AuthForm />;

  // Signed in — show the app
  return <App userId={user.id} email={user.email ?? ""} onSignOut={signOut} />;
}

// ---------- Authenticated app ----------

function App({ userId, email, onSignOut }: { userId: string; email: string; onSignOut: () => void }) {
  const [date, setDate] = useState(today());
  const [tab, setTab] = useState<Tab>("today");
  const [addOpen, setAddOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [prevDoneCount, setPrevDoneCount] = useState(0);

  const { data, deeds, streak, loading: deedsLoading, error, clearError, addDeed, updateDeed, deleteDeed, toggleDeed } = useDeeds(date, userId);

  const doneCount = deeds.filter((d) => d.completed).length;
  const totalCount = deeds.length;
  const isToday = date === today();

  useEffect(() => {
    if (isToday && totalCount > 0 && doneCount === totalCount && doneCount > prevDoneCount) {
      setCelebrate(true);
    }
    setPrevDoneCount(doneCount);
  }, [doneCount, totalCount, isToday]);

  const stopCelebration = useCallback(() => setCelebrate(false), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Celebration show={celebrate} onDone={stopCelebration} />
      {error && <Toast message={error} onClose={clearError} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="font-bold text-gray-900 tracking-tight">DeedTracker</span>
          </div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 text-xs font-semibold text-orange-600">
                🔥 {streak} {streak === 1 ? "day" : "days"}
              </div>
            )}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center hover:bg-indigo-200 transition-colors">
                {email[0].toUpperCase()}
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
                <p className="px-3 py-2 text-xs text-gray-400 truncate border-b border-gray-100">{email}</p>
                <button
                  onClick={onSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 flex">
          {(["today", "stats"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "today" ? "Deeds" : "Stats"}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
        {deedsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-sm">Loading your deeds…</p>
          </div>
        ) : tab === "today" ? (
          <>
            <DateNav date={date} onChange={setDate} />

            {totalCount > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{doneCount} of {totalCount} completed</span>
                  <span className="text-xs font-semibold text-indigo-600">
                    {Math.round((doneCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <DeedList
              deeds={deeds}
              date={date}
              onToggle={toggleDeed}
              onUpdate={updateDeed}
              onDelete={deleteDeed}
            />
          </>
        ) : (
          <>
            <StatsBar data={data} streak={streak} />
            <Heatmap data={data} />
            <CategoryChart data={data} />
          </>
        )}
      </main>

      {tab === "today" && !deedsLoading && (
        <button
          onClick={() => setAddOpen(true)}
          className="fixed bottom-6 right-1/2 translate-x-1/2 sm:right-6 sm:translate-x-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold px-5 py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
          Add deed
        </button>
      )}

      <DeedModal
        open={addOpen}
        date={date}
        onClose={() => setAddOpen(false)}
        onSave={(d) => addDeed(d as Omit<Deed, "id" | "createdAt" | "completed" | "completedAt">)}
      />
    </div>
  );
}

// ---------- Loading screen ----------

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="text-3xl">✨</div>
        <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </div>
  );
}

// ---------- Setup screen (shown when env vars are not configured) ----------

function SetupScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg w-full max-w-md p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">⚙️</div>
          <h1 className="font-bold text-gray-900 text-xl">Setup required</h1>
          <p className="text-sm text-gray-500 mt-1">Supabase environment variables are not configured.</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm font-mono text-gray-700 border border-gray-200">
          <p className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-1">Required in .env.local</p>
          <p>NEXT_PUBLIC_SUPABASE_URL=...</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
        </div>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Create a project at <span className="font-medium text-indigo-600">supabase.com</span></li>
          <li>Copy your URL and anon key from Project Settings → API</li>
          <li>Add them to <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</span></li>
          <li>Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}
