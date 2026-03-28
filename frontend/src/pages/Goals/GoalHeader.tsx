import { motion } from "motion/react";
import {
  Edit2,
  Calendar as CalendarIcon,
  Target,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Pin,
  Archive,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import type { UIGoal } from "../../types/goal.type";
import { getCategoryColor, CATEGORIES } from "../../utils/goalHelpers";

interface Props {
  selectedGoal: UIGoal;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onUpdate: (updates: Partial<UIGoal>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleArchive: (id: string) => Promise<void>;
  onTogglePin: (id: string) => Promise<void>;
}

export const GoalHeader = ({
  selectedGoal,
  isEditing,
  setIsEditing,
  onUpdate,
  onDelete,
  onToggleArchive,
  onTogglePin,
}: Props) => {
  const formattedDate =
    selectedGoal.deadline && !isNaN(new Date(selectedGoal.deadline).getTime())
      ? format(new Date(selectedGoal.deadline), "MMM d, yyyy")
      : "No deadline";

  return (
    <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
      <div className="max-w-3xl mx-auto">
        {isEditing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Title */}
            <input
              type="text"
              value={selectedGoal.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            {/* Description */}
            <textarea
              value={selectedGoal.description ?? ""}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full text-slate-600 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={2}
            />

            {/* Controls row */}
            <div className="flex items-center gap-4 flex-wrap">
              <input
                type="date"
                value={selectedGoal.deadline ?? ""}
                onChange={(e) => onUpdate({ deadline: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <select
                value={selectedGoal.category ?? "general"}
                onChange={(e) => onUpdate({ category: e.target.value })}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-auto bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Done Editing
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-start gap-6"
          >
            {/* Left: Info */}
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">
                  {selectedGoal.title}
                </h2>
                <span
                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(
                    selectedGoal.category ?? "general"
                  )}`}
                >
                  {selectedGoal.category ?? "general"}
                </span>
                {selectedGoal.isPinned && (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                    📌 Pinned
                  </span>
                )}
              </div>

              <p className="text-slate-600 mb-4 max-w-2xl">
                {selectedGoal.description || "No description provided."}
              </p>

              <div className="flex items-center gap-4 flex-wrap text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                  <CalendarIcon className="h-4 w-4" />
                  Deadline:{" "}
                  <span className="text-slate-800 ml-1">{formattedDate}</span>
                </span>
                <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                  <Target className="h-4 w-4" />
                  Status:{" "}
                  <span
                    className={`ml-1 ${
                      selectedGoal.status === "done"
                        ? "text-emerald-600"
                        : selectedGoal.status === "archived"
                        ? "text-slate-400"
                        : "text-indigo-600"
                    }`}
                  >
                    {selectedGoal.status}
                  </span>
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 bg-white shadow-sm"
                title="Edit Goal"
              >
                <Edit2 className="h-4 w-4" />
              </button>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors bg-white shadow-sm">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    className="w-52 bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-50 text-sm"
                    align="end"
                  >
                    {/* Toggle Done */}
                    <button
                      onClick={() =>
                        onUpdate({
                          status:
                            selectedGoal.status === "done" ? "active" : "done",
                        })
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark as{" "}
                      {selectedGoal.status === "done" ? "Active" : "Done"}
                    </button>

                    {/* Toggle Pin */}
                    <button
                      onClick={() => onTogglePin(selectedGoal._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <Pin className="h-4 w-4" />
                      {selectedGoal.isPinned ? "Unpin" : "Pin"} Goal
                    </button>

                    {/* Toggle Archive */}
                    <button
                      onClick={() => onToggleArchive(selectedGoal._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <Archive className="h-4 w-4" />
                      {selectedGoal.status === "archived"
                        ? "Unarchive"
                        : "Archive"}{" "}
                      Goal
                    </button>

                    <div className="h-px bg-slate-100 my-1" />

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(selectedGoal._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Goal
                    </button>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};