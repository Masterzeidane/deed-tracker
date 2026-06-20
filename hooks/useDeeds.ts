"use client";
import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { AppData, Deed, DayRecord } from "@/lib/types";
import {
  getDayRecord,
  upsertDeed as applyUpsert,
  deleteDeed as applyDelete,
  computeStreak,
} from "@/lib/storage";
import { today, nanoid } from "@/lib/utils";
import * as db from "@/lib/db";

// ---------- Action types ----------

type Action =
  | { type: "LOAD"; data: AppData }
  | { type: "ROLLBACK"; data: AppData }     // restores a pre-failure snapshot
  | { type: "ADD_DEED"; deed: Deed }
  | { type: "UPDATE_DEED"; deed: Deed }
  | { type: "DELETE_DEED"; deedId: string; date: string }
  | { type: "TOGGLE_DEED"; deedId: string; date: string };

// ---------- Reducer ----------

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "LOAD":
    case "ROLLBACK":
      return action.data;

    case "ADD_DEED":
      return withStreak(applyUpsert(state, action.deed));

    case "UPDATE_DEED":
      return withStreak(applyUpsert(state, action.deed));

    case "DELETE_DEED":
      return withStreak(applyDelete(state, action.deedId, action.date));

    case "TOGGLE_DEED": {
      const day = getDayRecord(state, action.date);
      const deed = day.deeds.find((d) => d.id === action.deedId);
      if (!deed) return state;
      const toggled: Deed = {
        ...deed,
        completed: !deed.completed,
        completedAt: !deed.completed ? new Date().toISOString() : undefined,
      };
      return withStreak(applyUpsert(state, toggled));
    }

    default:
      return state;
  }
}

// ---------- Helpers ----------

function withStreak(data: AppData): AppData {
  const t = today();
  return { ...data, streak: computeStreak(data, t), lastActiveDate: t };
}

function deedsToAppData(deeds: Deed[]): AppData {
  const days: Record<string, DayRecord> = {};
  for (const deed of deeds) {
    if (!days[deed.date]) days[deed.date] = { date: deed.date, deeds: [] };
    days[deed.date].deeds.push(deed);
  }
  return withStreak({ days, streak: 0, lastActiveDate: "" });
}

/** Returns true if the error looks like an auth/token problem. */
function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return msg.includes("jwt") || msg.includes("auth") || msg.includes("401") || msg.includes("unauthorized");
}

const EMPTY: AppData = { days: {}, streak: 0, lastActiveDate: "" };

// ---------- Hook ----------

export function useDeeds(date: string, userId: string | null) {
  const [data, dispatch] = useReducer(reducer, EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  // ---- Initial load ----
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    db.fetchRecentDeeds(userId, 90)
      .then((deeds) => dispatch({ type: "LOAD", data: deedsToAppData(deeds) }))
      .catch((err) => {
        console.error("Failed to load deeds:", err);
        setError("Could not load your deeds. Check your connection and refresh.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // ---- Cross-tab sync: refetch silently when this tab regains focus ----
  // Handles the case where another tab (or device) modified data while this tab was in the background.
  useEffect(() => {
    if (!userId) return;

    function onVisible() {
      if (document.visibilityState === "visible") {
        db.fetchRecentDeeds(userId!, 90)
          .then((deeds) => dispatch({ type: "LOAD", data: deedsToAppData(deeds) }))
          .catch(console.error); // silent — user is already seeing their data
      }
    }

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId]);

  // ---- Rollback helper ----
  // Snapshots state before an optimistic dispatch.
  // If the Supabase write fails: rolls back the UI and surfaces an error message.
  // If the error is auth-related: skips the toast (onAuthStateChange will handle sign-out).
  const withRollback = useCallback(
    async (
      action: Action,
      syncFn: () => Promise<void>,
      errorMessage: string
    ) => {
      const snapshot = dataRef.current;     // capture state BEFORE the optimistic update
      dispatch(action);                      // optimistic update — UI changes instantly

      try {
        await syncFn();                      // attempt Supabase write
      } catch (err) {
        console.error(err);
        dispatch({ type: "ROLLBACK", data: snapshot }); // undo the optimistic update

        // Auth errors are handled by onAuthStateChange redirecting to sign-in.
        // Showing a rollback toast on top of that would be confusing.
        if (!isAuthError(err)) {
          setError(errorMessage);
        }
      }
    },
    [] // dispatch is stable; dataRef is a ref
  );

  // ---- Action creators ----

  const addDeed = useCallback(
    async (partial: Omit<Deed, "id" | "createdAt" | "completed" | "completedAt">) => {
      if (!userId) return;
      const deed: Deed = {
        ...partial,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        completed: false,
      };
      await withRollback(
        { type: "ADD_DEED", deed },
        () => db.upsertDeed(userId, deed),
        "Couldn't save your deed — changes were reverted."
      );
    },
    [userId, withRollback]
  );

  const updateDeed = useCallback(
    async (deed: Deed) => {
      if (!userId) return;
      await withRollback(
        { type: "UPDATE_DEED", deed },
        () => db.upsertDeed(userId, deed),
        "Couldn't save your changes — they were reverted."
      );
    },
    [userId, withRollback]
  );

  const deleteDeedById = useCallback(
    async (deedId: string, d: string) => {
      if (!userId) return;
      await withRollback(
        { type: "DELETE_DEED", deedId, date: d },
        () => db.deleteDeedById(userId, deedId),
        "Couldn't delete that deed — it's been restored."
      );
    },
    [userId, withRollback]
  );

  const toggleDeed = useCallback(
    async (deedId: string, d: string) => {
      if (!userId) return;
      const deed = getDayRecord(dataRef.current, d).deeds.find((x) => x.id === deedId);
      if (!deed) return;
      const toggled: Deed = {
        ...deed,
        completed: !deed.completed,
        completedAt: !deed.completed ? new Date().toISOString() : undefined,
      };
      await withRollback(
        { type: "TOGGLE_DEED", deedId, date: d },
        () => db.upsertDeed(userId, toggled),
        "Couldn't save that change — it was reverted."
      );
    },
    [userId, withRollback]
  );

  return {
    data,
    deeds: getDayRecord(data, date).deeds,
    streak: data.streak,
    loading,
    error,
    clearError: () => setError(null),
    addDeed,
    updateDeed,
    deleteDeed: deleteDeedById,
    toggleDeed,
  };
}
