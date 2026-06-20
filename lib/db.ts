import { supabase } from "./supabase";
import { Deed } from "./types";

// ---------- row ↔ Deed conversion ----------

interface DeedRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  date: string;
}

function rowToDeed(row: DeedRow): Deed {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category as Deed["category"],
    completed: row.completed,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    date: row.date,
  };
}

function deedToRow(userId: string, deed: Deed): Omit<DeedRow, "user_id"> & { user_id: string } {
  return {
    id: deed.id,
    user_id: userId,
    title: deed.title,
    description: deed.description ?? null,
    category: deed.category,
    completed: deed.completed,
    created_at: deed.createdAt,
    completed_at: deed.completedAt ?? null,
    date: deed.date,
  };
}

// ---------- queries ----------

/** Fetch all deeds for this user from the last `days` days. */
export async function fetchRecentDeeds(userId: string, days: number): Promise<Deed[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("deeds")
    .select("*")
    .eq("user_id", userId)
    .gte("date", sinceStr)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as DeedRow[]).map(rowToDeed);
}

/** Insert or update a single deed. */
export async function upsertDeed(userId: string, deed: Deed): Promise<void> {
  const { error } = await supabase
    .from("deeds")
    .upsert(deedToRow(userId, deed));
  if (error) throw error;
}

/** Delete a deed by id (RLS ensures users can only delete their own). */
export async function deleteDeedById(userId: string, deedId: string): Promise<void> {
  const { error } = await supabase
    .from("deeds")
    .delete()
    .eq("id", deedId)
    .eq("user_id", userId);
  if (error) throw error;
}
