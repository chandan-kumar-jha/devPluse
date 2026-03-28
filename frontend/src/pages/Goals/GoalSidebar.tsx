import { Plus, Search, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CircularProgress } from "./CircularProgress";
import { getCategoryColor } from "../../utils/goalHelpers";
import type { UIGoal } from "../../types/goal.type";

interface Props {
  goals: UIGoal[];
  selectedGoalId: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  isCreating?: boolean;
}

export const GoalSidebar = ({
  goals,
  selectedGoalId,
  searchQuery,
  setSearchQuery,
  onSelect,
  onCreate,
  isCreating = false,
}: Props) => (
  <div className="w-full lg:w-1/3 max-w-sm border-r border-slate-200 bg-slate-50/30 flex flex-col z-10 flex-shrink-0 h-[40vh] lg:h-full">

    {/* Controls */}
    <div className="p-4 border-b border-slate-200 bg-white">
      <button
        onClick={onCreate}
        disabled={isCreating}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mb-4"
      >
        {isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isCreating ? "Creating..." : "New Goal"}
      </button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>
    </div>

    {/* Goal List */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <AnimatePresence>
        {goals.map((goal) => {
          const completed = goal.milestones.filter((m) => m.completed).length;
          const total = goal.milestones.length;
          const progress = total === 0 ? 0 : (completed / total) * 100;
          const isSelected = selectedGoalId === goal._id;

          return (
            <motion.div
              layout
              key={goal._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => onSelect(goal._id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-white border-indigo-300 shadow-md ring-1 ring-indigo-500/20"
                  : "bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md"
              } ${goal.status === "done" ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                <CircularProgress progress={progress} />
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold truncate ${
                      isSelected ? "text-indigo-700" : "text-slate-800"
                    }`}
                  >
                    {goal.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 mb-2">
                    {total > 0
                      ? `${completed} of ${total} milestones`
                      : "No milestones yet"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(
                        goal.category ?? "general"
                      )}`}
                    >
                      {goal.category ?? "general"}
                    </span>
                    {goal.status === "done" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Done
                      </span>
                    )}
                    {goal.isPinned && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        📌 Pinned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {goals.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <p className="text-sm">No goals found.</p>
        </div>
      )}
    </div>
  </div>
);