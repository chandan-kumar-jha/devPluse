// src/api/goals.api.ts
import { api } from "./axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GoalStatus = "active" | "done" | "archived";

export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Goal {
  _id: string;
  userId: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: GoalStatus;
  progress: number;
  pinned: boolean;
  category: string;
  sessionCount: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface GoalCounts {
  active: number;
  done: number;
  archived: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GoalsListResponse {
  success: boolean;
  data: {
    goals: Goal[];
    counts: GoalCounts;
    pagination: Pagination;
  };
}

export interface GoalResponse {
  success: boolean;
  message?: string;
  data: { goal: Goal };
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  milestones?: { title: string }[];
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  deadline?: string;
  category?: string;
  status?: GoalStatus;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const goalAPI = {
  // Goals CRUD
  getGoals: (params?: {
    page?: number;
    limit?: number;
    status?: GoalStatus;
    category?: string;
    sort?: "newest" | "oldest" | "deadline" | "progress";
  }) => api.get<GoalsListResponse>("/goals", { params }),

  getGoalById: (id: string) => api.get<GoalResponse>(`/goals/${id}`),

  createGoal: (data: CreateGoalPayload) =>
    api.post<GoalResponse>("/goals", data),

  updateGoal: (id: string, data: UpdateGoalPayload) =>
    api.patch<GoalResponse>(`/goals/${id}`, data),

  deleteGoal: (id: string) => api.delete(`/goals/${id}`),

  archiveGoal: (id: string) => api.patch<GoalResponse>(`/goals/${id}/archive`),

  togglePin: (id: string) => api.patch<GoalResponse>(`/goals/${id}/pin`),

  // Milestones
  addMilestone: (goalId: string, title: string) =>
    api.post<GoalResponse>(`/goals/${goalId}/milestones`, { title }),

  toggleMilestone: (goalId: string, milestoneId: string) =>
    api.patch<GoalResponse>(`/goals/${goalId}/milestones/${milestoneId}`),

  deleteMilestone: (goalId: string, milestoneId: string) =>
    api.delete<GoalResponse>(`/goals/${goalId}/milestones/${milestoneId}`),
};