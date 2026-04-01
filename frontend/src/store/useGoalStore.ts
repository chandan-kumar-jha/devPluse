// src/store/useGoalsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  goalAPI,
  type Goal,
  type GoalCounts,
  type Pagination,
  type CreateGoalPayload,
  type UpdateGoalPayload,
  type GoalStatus,
} from "../api/goal.api";

// ─── State ────────────────────────────────────────────────────────────────────

interface GoalsState {
  goals: Goal[];
  counts: GoalCounts;
  pagination: Pagination | null;
  selectedGoalId: string | null;
  loading: boolean;
  actionLoading: boolean; // for mutations (create/update/delete)
  error: string | null;

  // Selectors
  selectedGoal: () => Goal | null;

  // Actions
  loadGoals: (params?: {
    page?: number;
    status?: GoalStatus;
    category?: string;
    sort?: "newest" | "oldest" | "deadline" | "progress";
  }) => Promise<void>;

  selectGoal: (id: string | null) => void;

  createGoal: (data: CreateGoalPayload) => Promise<Goal | null>;
  updateGoal: (id: string, data: UpdateGoalPayload) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;

  // Milestones
  addMilestone: (goalId: string, title: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;

  clearError: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const errMsg = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

/** Replace a single goal in the list by _id */
const replaceGoal = (goals: Goal[], updated: Goal): Goal[] =>
  goals.map((g) => (g._id === updated._id ? updated : g));

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGoalsStore = create<GoalsState>()(
  devtools(
    (set, get) => ({
      goals: [],
      counts: { active: 0, done: 0, archived: 0 },
      pagination: null,
      selectedGoalId: null,
      loading: false,
      actionLoading: false,
      error: null,

      // ── Selector ────────────────────────────────────────────────────────────
      selectedGoal: () => {
        const { goals, selectedGoalId } = get();
        return goals.find((g) => g._id === selectedGoalId) ?? null;
      },

      // ── Load ────────────────────────────────────────────────────────────────
      loadGoals: async (params) => {
        set({ loading: true, error: null });
        try {
          const res = await goalAPI.getGoals(params);
          const { goals, counts, pagination } = res.data.data;
          set({
            goals,
            counts,
            pagination,
            loading: false,
            // auto-select first goal if none selected
            selectedGoalId:
              get().selectedGoalId ??
              (goals.length > 0 ? goals[0]._id : null),
          });
        } catch (err) {
          set({ error: errMsg(err, "Failed to load goals"), loading: false });
        }
      },

      // ── Select ──────────────────────────────────────────────────────────────
      selectGoal: (id) => set({ selectedGoalId: id }),

      // ── Create ──────────────────────────────────────────────────────────────
      createGoal: async (data) => {
        set({ actionLoading: true, error: null });
        try {
          const res = await goalAPI.createGoal(data);
          const newGoal = res.data.data.goal;
          set((s) => ({
            goals: [newGoal, ...s.goals],
            counts: { ...s.counts, active: s.counts.active + 1 },
            selectedGoalId: newGoal._id,
            actionLoading: false,
          }));
          return newGoal;
        } catch (err) {
          set({ error: errMsg(err, "Failed to create goal"), actionLoading: false });
          return null;
        }
      },

      // ── Update ──────────────────────────────────────────────────────────────
      updateGoal: async (id, data) => {
        // Optimistic
        set((s) => ({
          goals: s.goals.map((g) => (g._id === id ? { ...g, ...data } : g)),
        }));
        try {
          const res = await goalAPI.updateGoal(id, data);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
          }));
        } catch (err) {
          // reload to revert
          get().loadGoals();
          set({ error: errMsg(err, "Failed to update goal") });
        }
      },

      // ── Delete ──────────────────────────────────────────────────────────────
      deleteGoal: async (id) => {
        const prev = get().goals;
        const remaining = prev.filter((g) => g._id !== id);
        const deletedGoal = prev.find((g) => g._id === id);
        set((s) => ({
          goals: remaining,
          selectedGoalId:
            s.selectedGoalId === id
              ? (remaining[0]?._id ?? null)
              : s.selectedGoalId,
          counts: deletedGoal
            ? {
                ...s.counts,
                [deletedGoal.status]:
                  Math.max(0, s.counts[deletedGoal.status as keyof typeof s.counts] - 1),
              }
            : s.counts,
        }));
        try {
          await goalAPI.deleteGoal(id);
        } catch (err) {
          set({ goals: prev, error: errMsg(err, "Failed to delete goal") });
        }
      },

      // ── Archive ─────────────────────────────────────────────────────────────
      archiveGoal: async (id) => {
        try {
          const res = await goalAPI.archiveGoal(id);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
            counts: {
              ...s.counts,
              active: Math.max(0, s.counts.active - 1),
              archived: s.counts.archived + 1,
            },
          }));
        } catch (err) {
          set({ error: errMsg(err, "Failed to archive goal") });
        }
      },

      // ── Pin ─────────────────────────────────────────────────────────────────
      togglePin: async (id) => {
        // Optimistic
        set((s) => ({
          goals: s.goals.map((g) =>
            g._id === id ? { ...g, pinned: !g.pinned } : g
          ),
        }));
        try {
          const res = await goalAPI.togglePin(id);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
          }));
        } catch (err) {
          set((s) => ({
            goals: s.goals.map((g) =>
              g._id === id ? { ...g, pinned: !g.pinned } : g
            ),
            error: errMsg(err, "Failed to pin goal"),
          }));
        }
      },

      // ── Milestones ──────────────────────────────────────────────────────────
      addMilestone: async (goalId, title) => {
        try {
          const res = await goalAPI.addMilestone(goalId, title);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
          }));
        } catch (err) {
          set({ error: errMsg(err, "Failed to add milestone") });
        }
      },

      toggleMilestone: async (goalId, milestoneId) => {
        // Optimistic
        set((s) => ({
          goals: s.goals.map((g) =>
            g._id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.map((m) =>
                    m._id === milestoneId
                      ? { ...m, completed: !m.completed }
                      : m
                  ),
                }
              : g
          ),
        }));
        try {
          const res = await goalAPI.toggleMilestone(goalId, milestoneId);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
          }));
        } catch (err) {
          get().loadGoals();
          set({ error: errMsg(err, "Failed to toggle milestone") });
        }
      },

      deleteMilestone: async (goalId, milestoneId) => {
        // Optimistic
        set((s) => ({
          goals: s.goals.map((g) =>
            g._id === goalId
              ? {
                  ...g,
                  milestones: g.milestones.filter((m) => m._id !== milestoneId),
                }
              : g
          ),
        }));
        try {
          const res = await goalAPI.deleteMilestone(goalId, milestoneId);
          set((s) => ({
            goals: replaceGoal(s.goals, res.data.data.goal),
          }));
        } catch (err) {
          get().loadGoals();
          set({ error: errMsg(err, "Failed to delete milestone") });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "GoalsStore" }
  )
);