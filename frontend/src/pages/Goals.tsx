// src/pages/Goals/index.tsx
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal, LayoutDashboard, Target, Code2,
  Bell, Settings, LogOut, Plus, ChevronDown,
  Search, Calendar as CalendarIcon,
  MoreVertical, CheckCircle2, Clock,
  Trash2, Edit2, X, MapPin, ChevronRight,
  Pin, Archive, Loader2, AlertCircle,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { useGoalsStore } from "..//store/useGoalStore";
import type { Goal, GoalStatus } from "..//api/goal.api";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["Learning", "Infrastructure", "Career", "Maintenance", "Product", "Backend", "Frontend"];

const getCategoryColor = (category: string) => {
  const map: Record<string, string> = {
    Learning:       "bg-purple-100 text-purple-700 border-purple-200",
    Infrastructure: "bg-orange-100 text-orange-700 border-orange-200",
    Career:         "bg-indigo-100 text-indigo-700 border-indigo-200",
    Maintenance:    "bg-red-100 text-red-700 border-red-200",
    Backend:        "bg-blue-100 text-blue-700 border-blue-200",
    Frontend:       "bg-teal-100 text-teal-700 border-teal-200",
  };
  return map[category] ?? "bg-slate-100 text-slate-700 border-slate-200";
};

const STATUS_LABEL: Record<GoalStatus, string> = {
  active:   "Active",
  done:     "Done",
  archived: "Archived",
};

// ─── Circular Progress ────────────────────────────────────────────────────────

const CircularProgress = ({
  progress, size = 44, strokeWidth = 4,
}: { progress: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor"
          strokeWidth={strokeWidth} fill="transparent" className="text-slate-100" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={progress === 100 ? "text-emerald-500" : "text-indigo-600"}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const GoalCardSkeleton = () => (
  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-full bg-slate-100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-5 bg-slate-100 rounded w-16" />
      </div>
    </div>
  </div>
);

// ─── Goals Page ───────────────────────────────────────────────────────────────

export const Goals = () => {
  

  const {
    goals,  loading, actionLoading, error,
    loadGoals, selectGoal, selectedGoal: getSelectedGoal,
    createGoal, updateGoal, deleteGoal, archiveGoal, togglePin,
    addMilestone, toggleMilestone, deleteMilestone,
    clearError,
  } = useGoalsStore();

  const selectedGoal = getSelectedGoal();

  const [searchQuery, setSearchQuery]         = useState("");
  const [isEditingGoal, setIsEditingGoal]     = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [editDraft, setEditDraft]             = useState<Partial<Goal>>({});
  const [statusFilter, setStatusFilter]       = useState<GoalStatus | "all">("all");

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Keep edit draft in sync when selected goal changes
  useEffect(() => {
    if (selectedGoal) {
      setEditDraft({
        title:       selectedGoal.title,
        description: selectedGoal.description ?? "",
        deadline:    selectedGoal.deadline
          ? selectedGoal.deadline.slice(0, 10)
          : "",
        category:    selectedGoal.category,
      });
      setIsEditingGoal(false);
    }
  }, [selectedGoal?._id]);

  const filteredGoals = useMemo(() => {
    return goals
      .filter((g) => {
        const matchSearch =
          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (g.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || g.status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (a.status !== b.status) return a.status === "active" ? -1 : 1;
        return 0;
      });
  }, [goals, searchQuery, statusFilter]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreateGoal = async () => {
    const newGoal = await createGoal({
      title:    "New Objective",
      category: "Learning",
    });
    if (newGoal) {
      setEditDraft({ title: "New Objective", category: "Learning", description: "", deadline: "" });
      setIsEditingGoal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedGoal) return;
    await updateGoal(selectedGoal._id, {
      title:       editDraft.title,
      description: editDraft.description ?? undefined,
      deadline:    editDraft.deadline || undefined,
      category:    editDraft.category,
    });
    setIsEditingGoal(false);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !newMilestoneTitle.trim()) return;
    await addMilestone(selectedGoal._id, newMilestoneTitle.trim());
    setNewMilestoneTitle("");
  };

  const handleToggleStatus = async (goal: Goal) => {
    const newStatus: GoalStatus = goal.status === "done" ? "active" : "done";
    await updateGoal(goal._id, { status: newStatus });
  };

  const getMilestoneProgress = (goal: Goal) => {
    if (!goal.milestones.length) return goal.progress;
    return (goal.milestones.filter((m) => m.completed).length / goal.milestones.length) * 100;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">


      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">

        {/* Header */}
        

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mx-4 mt-3 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
            >
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={clearError} className="p-1 hover:bg-red-100 rounded-lg">
                <X className="h-4 w-4 text-red-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* ── LEFT: Goals List ──────────────────────────────────────────── */}
          <div className="w-full lg:w-1/3 max-w-sm border-r border-slate-200 bg-slate-50/30 flex flex-col z-10 flex-shrink-0 h-[40vh] lg:h-full">
            <div className="p-4 border-b border-slate-200 bg-white">
              <button
                onClick={handleCreateGoal}
                disabled={actionLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mb-4"
              >
                {actionLoading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Plus className="h-4 w-4" />}
                New Goal
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text" placeholder="Search goals..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && !goals.length
                ? Array(3).fill(0).map((_, i) => <GoalCardSkeleton key={i} />)
                : (
                  <AnimatePresence>
                    {filteredGoals.map((goal) => {
                      const progress = getMilestoneProgress(goal);
                      const isSelected = selectedGoal?._id === goal._id;
                      const compCount = goal.milestones.filter((m) => m.completed).length;
                      const total = goal.milestones.length;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                          key={goal._id}
                          onClick={() => { selectGoal(goal._id); setIsEditingGoal(false); }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-white border-indigo-300 shadow-md ring-1 ring-indigo-500/20"
                              : "bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md"
                          } ${goal.status === "done" ? "opacity-70" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <CircularProgress progress={progress} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                {goal.pinned && <Pin className="h-3 w-3 text-indigo-500 flex-shrink-0" />}
                                <h3 className={`font-semibold truncate text-sm ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>
                                  {goal.title}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">
                                {total > 0 ? `${compCount} of ${total} milestones` : "No milestones"}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(goal.category)}`}>
                                  {goal.category}
                                </span>
                                {goal.status === "done" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <CheckCircle2 className="h-3 w-3" /> Done
                                  </span>
                                )}
                                {goal.status === "archived" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <Archive className="h-3 w-3" /> Archived
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              {!loading && filteredGoals.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Target className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">No goals found.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Milestone Roadmap ──────────────────────────────────── */}
          <div className="flex-1 bg-white relative flex flex-col h-[60vh] lg:h-full overflow-hidden">
            {selectedGoal ? (
              <>
                {/* Goal Header */}
                <div className="p-6 lg:p-8 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
                  <div className="max-w-3xl mx-auto">
                    {isEditingGoal ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <input
                          type="text"
                          value={editDraft.title ?? ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                          className="text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                        <textarea
                          value={editDraft.description ?? ""}
                          onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                          className="w-full text-slate-600 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          rows={2}
                          placeholder="Goal description..."
                        />
                        <div className="flex items-center gap-4 flex-wrap">
                          <input
                            type="date"
                            value={editDraft.deadline ?? ""}
                            onChange={(e) => setEditDraft((d) => ({ ...d, deadline: e.target.value }))}
                            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                          <select
                            value={editDraft.category ?? ""}
                            onChange={(e) => setEditDraft((d) => ({ ...d, category: e.target.value }))}
                            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => setIsEditingGoal(false)}
                              className="px-4 py-1.5 rounded-lg text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              disabled={actionLoading}
                              className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                            >
                              {actionLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                              Save
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-start gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {selectedGoal.pinned && <Pin className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800">{selectedGoal.title}</h2>
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(selectedGoal.category)}`}>
                              {selectedGoal.category}
                            </span>
                          </div>
                          {selectedGoal.description && (
                            <p className="text-slate-600 mb-4 max-w-2xl">{selectedGoal.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-sm font-medium text-slate-500 flex-wrap">
                            {selectedGoal.deadline && (
                              <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                                <CalendarIcon className="h-4 w-4" />
                                {format(new Date(selectedGoal.deadline), "MMM d, yyyy")}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm capitalize">
                              <Target className="h-4 w-4" />
                              <span className={
                                selectedGoal.status === "done" ? "text-emerald-600" :
                                selectedGoal.status === "archived" ? "text-slate-500" : "text-indigo-600"
                              }>
                                {STATUS_LABEL[selectedGoal.status]}
                              </span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                              <CheckCircle2 className="h-4 w-4" />
                              {selectedGoal.milestones.filter((m) => m.completed).length}/{selectedGoal.milestones.length} done
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setIsEditingGoal(true)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 bg-white shadow-sm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent bg-white shadow-sm">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                className="w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 text-sm"
                                align="end"
                              >
                                <button
                                  onClick={() => handleToggleStatus(selectedGoal)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Mark as {selectedGoal.status === "done" ? "Active" : "Done"}
                                </button>
                                <button
                                  onClick={() => togglePin(selectedGoal._id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                  <Pin className="h-4 w-4" />
                                  {selectedGoal.pinned ? "Unpin" : "Pin"} Goal
                                </button>
                                {selectedGoal.status !== "archived" && (
                                  <button
                                    onClick={() => archiveGoal(selectedGoal._id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                  >
                                    <Archive className="h-4 w-4" />
                                    Archive Goal
                                  </button>
                                )}
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={() => deleteGoal(selectedGoal._id)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {/* Milestone Roadmap */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative bg-slate-50/30">
                  <div className="max-w-2xl mx-auto relative">
                    {/* Path line */}
                    <div className="absolute left-[23px] lg:left-[39px] top-6 bottom-16 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent" />

                    <div className="space-y-6 lg:space-y-8 relative">
                      <AnimatePresence>
                        {selectedGoal.milestones
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((milestone, index) => (
                            <motion.div
                              key={milestone._id}
                              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start gap-4 lg:gap-6 group"
                            >
                              {/* Node */}
                              <button
                                onClick={() => toggleMilestone(selectedGoal._id, milestone._id)}
                                className={`relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-white border-4 transition-all duration-300 shadow-sm group-hover:scale-105 ${
                                  milestone.completed
                                    ? "border-emerald-500 text-emerald-500"
                                    : "border-slate-300 text-slate-300 hover:border-indigo-400 hover:text-indigo-400"
                                }`}
                              >
                                {milestone.completed ? (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <CheckCircle2 className="h-6 w-6 lg:h-10 lg:w-10" />
                                  </motion.div>
                                ) : (
                                  <span className="text-sm lg:text-xl font-bold">{index + 1}</span>
                                )}
                              </button>

                              {/* Card */}
                              <div className={`flex-1 bg-white rounded-xl border p-4 lg:p-5 shadow-sm transition-all duration-300 ${
                                milestone.completed
                                  ? "border-emerald-100 bg-emerald-50/30"
                                  : "border-slate-200 hover:shadow-md hover:border-indigo-200"
                              }`}>
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                                      milestone.completed ? "text-emerald-600" : "text-slate-400"
                                    }`}>
                                      {milestone.completed ? "Completed" : "Pending"}
                                    </span>
                                    <h4 className={`text-base lg:text-lg font-medium transition-all ${
                                      milestone.completed ? "text-slate-500 line-through" : "text-slate-800"
                                    }`}>
                                      {milestone.title}
                                    </h4>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => deleteMilestone(selectedGoal._id, milestone._id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </AnimatePresence>

                      {/* Add Milestone */}
                      <motion.div layout className="flex items-center gap-4 lg:gap-6 pt-4">
                        <div className="relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-50 border-4 border-dashed border-slate-200 text-slate-400">
                          <Plus className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <form onSubmit={handleAddMilestone} className="relative flex items-center">
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
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-50/50">
                <div className="max-w-md">
                  <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Goal to View Roadmap</h3>
                  <p className="text-slate-500 text-sm">Choose an objective from the list or create a new one to begin your journey.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};