"use client";
import { useState } from "react";
import { Deed } from "@/lib/types";
import DeedItem from "./DeedItem";
import DeedModal from "./DeedModal";

interface Props {
  deeds: Deed[];
  date: string;
  onToggle: (id: string, date: string) => void;
  onUpdate: (deed: Deed) => void;
  onDelete: (id: string, date: string) => void;
}

export default function DeedList({ deeds, date, onToggle, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<Deed | null>(null);

  const pending = deeds.filter((d) => !d.completed);
  const completed = deeds.filter((d) => d.completed);

  if (deeds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm font-medium">No deeds yet</p>
        <p className="text-xs mt-1">Tap + to add your first deed for the day</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pending.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              To do · {pending.length}
            </p>
            <div className="space-y-2">
              {pending.map((deed) => (
                <DeedItem
                  key={deed.id}
                  deed={deed}
                  onToggle={() => onToggle(deed.id, deed.date)}
                  onEdit={() => setEditing(deed)}
                  onDelete={() => onDelete(deed.id, deed.date)}
                />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Completed · {completed.length}
            </p>
            <div className="space-y-2">
              {completed.map((deed) => (
                <DeedItem
                  key={deed.id}
                  deed={deed}
                  onToggle={() => onToggle(deed.id, deed.date)}
                  onEdit={() => setEditing(deed)}
                  onDelete={() => onDelete(deed.id, deed.date)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <DeedModal
        open={!!editing}
        date={date}
        initial={editing ?? undefined}
        onClose={() => setEditing(null)}
        onSave={(d) => onUpdate(d as Deed)}
      />
    </>
  );
}
