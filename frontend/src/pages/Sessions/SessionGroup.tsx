import type{ Session } from "../../types/Sessions.type";
import { SessionCard } from "./SessionCard";

type SessionGroupProps = {
  dateLabel: string;
  sessions: Session[];
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
};

export const SessionGroup = ({
  dateLabel,
  sessions,
  onEdit,
  onDelete,
  deletingId,
}: SessionGroupProps) => (
  <div className="space-y-4">
    {/* Date Group Header */}
    <div className="flex items-center gap-4">
      <h3 className="text-sm font-bold text-slate-800 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
        {dateLabel}
      </h3>
      <div className="h-px bg-slate-200 flex-1" />
      <p className="text-xs font-medium text-slate-500">
        {sessions.reduce((acc, curr) => acc + curr.duration, 0)} mins total
      </p>
    </div>

    {/* Sessions within group */}
    <div className="grid grid-cols-1 gap-4">
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </div>
  </div>
);
