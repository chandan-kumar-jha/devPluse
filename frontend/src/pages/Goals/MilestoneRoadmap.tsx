import { CheckCircle2, Trash2, Plus, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { UIGoal } from "../../types/goal.type";

interface Props {
  selectedGoal: UIGoal;
  newMilestoneTitle: string;
  setNewMilestoneTitle: (val: string) => void;
  onToggle: (gId: string, mId: string) => Promise<void>;
  onDelete: (gId: string, mId: string) => Promise<void>;
  onAdd: (e: React.FormEvent) => Promise<void>;
}

export const MilestoneRoadmap = ({
  selectedGoal,
  newMilestoneTitle,
  setNewMilestoneTitle,
  onToggle,
  onDelete,
  onAdd,
}: Props) => (
  <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative bg-slate-50/30">
    <div className="max-w-2xl mx-auto relative">

      {/* Vertical path line */}
      <div className="absolute left-[23px] lg:left-[39px] top-6 bottom-16 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent pointer-events-none" />

      <div className="space-y-6 lg:space-y-8 relative">
        <AnimatePresence>
          {selectedGoal.milestones.map((milestone, index) => (
            <motion.div
              key={milestone._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-start gap-4 lg:gap-6 group"
            >
              {/* Circle node */}
              <button
                onClick={() => onToggle(selectedGoal._id, milestone._id)}
                className={`relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-white border-4 transition-all duration-300 shadow-sm group-hover:scale-105 ${
                  milestone.completed
                    ? "border-emerald-500 text-emerald-500"
                    : "border-slate-300 text-slate-300 hover:border-indigo-400 hover:text-indigo-400"
                }`}
              >
                {milestone.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center justify-center"
                  >
                    <CheckCircle2 className="h-6 w-6 lg:h-10 lg:w-10" />
                  </motion.div>
                ) : (
                  <span className="text-sm lg:text-xl font-bold">
                    {index + 1}
                  </span>
                )}
              </button>

              {/* Card */}
              <div
                className={`flex-1 bg-white rounded-xl border p-4 lg:p-5 shadow-sm transition-all duration-300 ${
                  milestone.completed
                    ? "border-emerald-100 bg-emerald-50/30"
                    : "border-slate-200 hover:shadow-md hover:border-indigo-200"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                        milestone.completed
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {milestone.completed ? "Completed" : "Pending"}
                    </span>
                    <h4
                      className={`text-base lg:text-lg font-medium transition-all ${
                        milestone.completed
                          ? "text-slate-500 line-through"
                          : "text-slate-800"
                      }`}
                    >
                      {milestone.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onDelete(selectedGoal._id, milestone._id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                    title="Delete Milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add milestone row */}
        <motion.div
          layout
          className="flex items-center gap-4 lg:gap-6 pt-4"
        >
          <div className="relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-50 border-4 border-dashed border-slate-200 text-slate-400">
            <Plus className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <form onSubmit={onAdd} className="relative flex items-center">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Type next milestone and press Enter..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 lg:py-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm lg:text-base"
              />
              <button
                type="submit"
                disabled={!newMilestoneTitle.trim()}
                className="absolute right-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Empty state */}
        {selectedGoal.milestones.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">
              No milestones yet. Add your first step above.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);