import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { GoalSidebar } from "./GoalSidebar";
import { GoalHeader } from "./GoalHeader";
import { MilestoneRoadmap } from "./MilestoneRoadmap";
import { useGoalStore } from "../../store/useGoalStore";
import type { UIGoal } from "../../types/goal.type";

export const Goals = () => {
  const {
    goals,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleArchive,
    togglePin,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    isLoading,
  } = useGoalStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  // Guard against double-clicks / StrictMode double-invoke
  const isCreating = useRef(false);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Auto-select first goal once loaded, but don't override user selection
  useEffect(() => {
    if (!selectedGoalId && goals.length > 0) {
      setSelectedGoalId(goals[0]._id);
    }
  }, [goals, selectedGoalId]);

  const selectedGoal: UIGoal | null = useMemo(() => {
    if (!goals.length) return null;
    if (!selectedGoalId) return goals[0];
    return goals.find((g) => g._id === selectedGoalId) ?? goals[0];
  }, [goals, selectedGoalId]);

  const filteredGoals = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return goals
      .filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (a.status === "active" && b.status !== "active") return -1;
        if (b.status === "active" && a.status !== "active") return 1;
        return 0;
      });
  }, [goals, searchQuery]);

  // ── Actions ──────────────────────────────────────────────

  const handleCreateGoal = async () => {
    // Prevent double-fire from StrictMode or fast double-click
    if (isCreating.current) return;
    isCreating.current = true;

    try {
      await createGoal({
        title: "New Objective",
        description: "Define what success looks like.",
        category: "general",
      });

      // Read fresh state directly — avoids stale closure after async
      const latest = useGoalStore.getState().goals;
      const newest = latest[0];

      if (newest?._id) {
        setSelectedGoalId(newest._id);
        setIsEditingGoal(true);
      }
    } finally {
      isCreating.current = false;
    }
  };

  const handleUpdateGoal = async (updates: Partial<UIGoal>) => {
    if (!selectedGoal?._id) return;
    await updateGoal(selectedGoal._id, updates);
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteGoal(id);
    const remaining = useGoalStore.getState().goals;
    setSelectedGoalId(remaining[0]?._id ?? null);
    setIsEditingGoal(false);
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !newMilestoneTitle.trim()) return;
    await addMilestone(selectedGoal._id, newMilestoneTitle.trim());
    setNewMilestoneTitle("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="hidden md:flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-800">
              Goal & Milestone Tracker
            </h1>
          </div>
        </header>

        {/* Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          <GoalSidebar
            goals={filteredGoals}
            selectedGoalId={selectedGoal?._id ?? null}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelect={(id) => {
              setSelectedGoalId(id);
              setIsEditingGoal(false);
            }}
            onCreate={handleCreateGoal}
            isCreating={isLoading}
          />

          <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
            {selectedGoal ? (
              <>
                <GoalHeader
                  selectedGoal={selectedGoal}
                  isEditing={isEditingGoal}
                  setIsEditing={setIsEditingGoal}
                  onUpdate={handleUpdateGoal}
                  onDelete={handleDeleteGoal}
                  onToggleArchive={toggleArchive}
                  onTogglePin={togglePin}
                />
                <MilestoneRoadmap
                  selectedGoal={selectedGoal}
                  newMilestoneTitle={newMilestoneTitle}
                  setNewMilestoneTitle={setNewMilestoneTitle}
                  onToggle={toggleMilestone}
                  onDelete={deleteMilestone}
                  onAdd={handleAddMilestone}
                />
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
                <MapPin className="h-16 w-16 text-slate-300 mb-4 opacity-40" />
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  No Goal Selected
                </h3>
                <p className="text-slate-500 text-sm">
                  Select an objective from the sidebar or create a new one to
                  start tracking.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};