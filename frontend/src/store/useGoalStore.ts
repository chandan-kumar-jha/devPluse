import { create } from "zustand";
import { goalAPI, type GoalStatus } from "../api/goal.api";
import toast from "react-hot-toast";

export interface Milestone { _id: string; title: string; completed: boolean; order: number; }
export interface Goal {
  _id: string; userId: string; title: string; description?: string;
  deadline?: string; category?: string; status: GoalStatus;
  progress: number; pinned: boolean; sessionCount: number;
  milestones: Milestone[]; createdAt: string; updatedAt: string;
}
export interface GoalCounts { active: number; done: number; archived: number; }
export interface Pagination { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean; }
export type SortOption = "newest" | "oldest" | "deadline" | "progress";
interface GoalFilters { status?: GoalStatus; category?: string; sort: SortOption; page: number; limit: number; }

interface GoalState {
  goals: Goal[];
  selectedGoalId: string | null;
  counts: GoalCounts;
  pagination: Pagination;
  filters: GoalFilters;
  isLoadingList: boolean;
  isMutating: boolean;
  listError: string | null;
  selectedGoal: () => Goal | null;
  setFilters: (filters: Partial<GoalFilters>) => void;
  updateGoal: (id: string, payload: Partial<Goal>) => Promise<void>;
  fetchGoals: () => Promise<void>;
  createGoal: (payload: any) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<void>;
  addMilestone: (goalId: string, title: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  deleteMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  selectGoal: (id: string | null) => void;
}

const patchGoal = (goals: Goal[], id: string, patch: Partial<Goal>): Goal[] =>
  goals.map(g => g._id === id ? { ...g, ...patch } as Goal : g);

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  selectedGoalId: null,
  counts: { active: 0, done: 0, archived: 0 },
  pagination: { total: 0, page: 1, limit: 20, totalPages: 0, hasNext: false, hasPrev: false },
  filters: { sort: "newest", page: 1, limit: 20 },
  isLoadingList: false,
  isMutating: false,
  listError: null,

  selectedGoal: () => {
    const { goals, selectedGoalId } = get();
    return goals.find(g => g._id === selectedGoalId) ?? null;
  },

  setFilters: (incoming) => {
    set(s => ({ filters: { ...s.filters, ...incoming, page: incoming.page ?? 1 } }));
    get().fetchGoals();
  },

  fetchGoals: async () => {
    set({ isLoadingList: true, listError: null });
    try {
      const res = await goalAPI.getGoals(get().filters);
      const { goals, counts, pagination } = res.data.data;
      set({ 
        goals, counts, pagination, isLoadingList: false,
        selectedGoalId: get().selectedGoalId || (goals[0]?._id ?? null)
      });
    } catch (err: any) {
      set({ isLoadingList: false, listError: err.response?.data?.message });
    }
  },
updateGoal: async (id, payload) => {
  // Prevent API calls on temporary IDs
  if (id.startsWith('temp-')) return;

  // 1. Save the previous state in case we need to rollback on error
  const previousGoals = get().goals;

  // 2. OPTIMISTIC UPDATE: Update the local goals array immediately
  set((state) => ({
    goals: state.goals.map((g) =>
      g._id === id ? { ...g, ...payload } : g
    ),
  }));

  try {
    const res = await goalAPI.updateGoal(id, payload);
    // 3. Sync with the actual server data once it returns
    const serverGoal = res.data.data.goal;
    set((state) => ({
      goals: state.goals.map((g) => (g._id === id ? serverGoal : g)),
    }));
  } catch (err: any) {
    // 4. ROLLBACK: If the server fails, revert to the previous state
    set({ goals: previousGoals });
    toast.error(err.response?.data?.message || "Update failed");
  }
},

  createGoal: async (payload) => {
    const tempId = `temp-${Date.now()}`;
    const tempGoal: Goal = {
      _id: tempId, userId: "pending", title: payload.title || "New Objective",
      description: payload.description || "", category: payload.category || "Learning",
      status: "active", progress: 0, pinned: false, sessionCount: 0,
      milestones: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };

    set((s) => ({ goals: [tempGoal, ...s.goals], selectedGoalId: tempId }));

    try {
      const res = await goalAPI.createGoal(payload);
      const serverGoal = res.data.data.goal;
      
      set((s) => ({
        goals: s.goals.map((g) => (g._id === tempId ? serverGoal : g)),
        // Critical: Update the selection to the real ID from the server
        selectedGoalId: serverGoal._id,
      }));
      return serverGoal;
    } catch {
      set((s) => ({ goals: s.goals.filter((g) => g._id !== tempId), selectedGoalId: null }));
      toast.error("Failed to create goal");
      return null;
    }
  },

  deleteGoal: async (id) => {
    if (id.startsWith('temp-')) {
        set(s => ({ goals: s.goals.filter(g => g._id !== id), selectedGoalId: null }));
        return;
    }
    set({ isMutating: true });
    try {
      await goalAPI.deleteGoal(id);
      set(s => {
        const remaining = s.goals.filter(g => g._id !== id);
        return { goals: remaining, isMutating: false, selectedGoalId: remaining[0]?._id ?? null };
      });
      toast.success("Goal Deleted");
    } catch { set({ isMutating: false }); }
  },

  addMilestone: async (goalId, title) => {
    if (goalId.startsWith('temp-')) return;
    try {
      const res = await goalAPI.addMilestone(goalId, title);
      set(s => ({ goals: patchGoal(s.goals, goalId, res.data.data.goal) }));
    } catch { toast.error("Failed to add milestone"); }
  },

  toggleMilestone: async (goalId, milestoneId) => {
    if (goalId.startsWith('temp-')) return;
    const prev = get().goals;
    set(s => ({
      goals: s.goals.map(g => {
        if (g._id !== goalId) return g;
        const milestones = g.milestones.map(m => m._id === milestoneId ? { ...m, completed: !m.completed } : m);
        const progress = Math.round((milestones.filter(m => m.completed).length / (milestones.length || 1)) * 100);
        return { ...g, milestones, progress, status: progress === 100 ? "done" : "active" };
      })
    }));
    try {
      const res = await goalAPI.toggleMilestone(goalId, milestoneId);
      set(s => ({ goals: patchGoal(s.goals, goalId, res.data.data.goal) }));
    } catch { set({ goals: prev }); }
  },

  deleteMilestone: async (goalId, milestoneId) => {
    if (goalId.startsWith('temp-')) return;
    const prev = get().goals;
    set(s => ({
      goals: s.goals.map(g => {
        if (g._id !== goalId) return g;
        const ms = g.milestones.filter(m => m._id !== milestoneId);
        const prog = ms.length ? Math.round((ms.filter(m => m.completed).length / ms.length) * 100) : 0;
        return { ...g, milestones: ms, progress: prog };
      })
    }));
    try { await goalAPI.deleteMilestone(goalId, milestoneId); } 
    catch { set({ goals: prev }); }
  },
  selectGoal: (id) => set({ selectedGoalId: id })
}));