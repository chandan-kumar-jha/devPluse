import { motion } from "motion/react";
import { Clock, Edit2, Trash2, Tag as TagIcon, Target, Code2, Loader2 } from "lucide-react";
import type { Session } from "../../types/Sessions.type";

type SessionCardProps = {
  session: Session;
  onEdit: (session: Session) => void;
  onDelete: (id: string) => void;
  /** id of the session currently being deleted (from store) */
  deletingId: string | null;
};

export const SessionCard = ({
  session,
  onEdit,
  onDelete,
  deletingId,
}: SessionCardProps) => {
  const isBeingDeleted = deletingId === session.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isBeingDeleted ? 0.5 : 1, y: 0 }}
      key={session.id}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
        {/* Left Column: Duration & Icon */}
        <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-1 sm:w-24 shrink-0 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div className="text-left sm:text-center">
            <p className="text-lg font-bold text-slate-800 leading-none">
              {session.duration}
            </p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              mins
            </p>
          </div>
        </div>

        {/* Main Column: Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-slate-900 mb-1 pr-10">
            {session.title}
          </h4>
          {session.notes && (
            <p className="text-sm text-slate-600 mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
              {session.notes}
            </p>
          )}

          {/* Tags & Links Row */}
          <div className="flex flex-wrap items-center gap-2 mt-auto">
            {session.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1"
              >
                <TagIcon className="h-3 w-3 opacity-50" /> {tag}
              </span>
            ))}
            {session.goalId && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Target className="h-3 w-3 opacity-70" /> Goal: {session.goalId}
              </span>
            )}
            {session.skillId && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Code2 className="h-3 w-3 opacity-70" /> Skill: {session.skillId}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <div className="absolute top-4 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-100 shadow-sm">
          <button
            onClick={() => onEdit(session)}
            disabled={isBeingDeleted}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-40"
            title="Edit session"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(session.id)}
            disabled={isBeingDeleted}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40"
            title="Delete session"
          >
            {isBeingDeleted ? (
              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
