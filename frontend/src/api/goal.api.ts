import { api } from "./axios"; // ✅ use your existing instance

/**
 * 🧠 Types (API-level, refined later in Problem 3)
 */
export type GoalStatus = "active" | "done" | "archived";

export interface CreateGoalPayload {
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  milestones?: {
    title: string;
  }[];
}

export interface UpdateGoalPayload {
  title?: string;
  description?: string;
  deadline?: string;
  category?: string;
  status?: GoalStatus;
}

/**
 * 🚀 Goal API (Fully aligned with backend)
 */
export const goalAPI = {
  // ============================
  // 📌 GOALS
  // ============================

  /**
   * GET /goals
   */
  getGoals: (params?: {
    page?: number;
    limit?: number;
    status?: GoalStatus;
    category?: string;
    sort?: "newest" | "oldest" | "deadline" | "progress";
  }) => {
    return api.get("/goals", { params });
  },

  /**
   * GET /goals/:id
   */
  getGoalById: (id: string) => {
    return api.get(`/goals/${id}`);
  },

  /**
   * POST /goals
   */
  createGoal: (data: CreateGoalPayload) => {
    return api.post("/goals", data);
  },

  /**
   * PATCH /goals/:id
   */
  updateGoal: (id: string, data: UpdateGoalPayload) => {
    return api.patch(`/goals/${id}`, data);
  },

  /**
   * DELETE /goals/:id
   */
  deleteGoal: (id: string) => {
    return api.delete(`/goals/${id}`);
  },

  /**
   * PATCH /goals/:id/archive
   */
  archiveGoal: (id: string) => {
    return api.patch(`/goals/${id}/archive`);
  },

  /**
   * PATCH /goals/:id/pin
   */
  togglePin: (id: string) => {
    return api.patch(`/goals/${id}/pin`);
  },

  // ============================
  // 📌 MILESTONES
  // ============================

  /**
   * POST /goals/:id/milestones
   */
  addMilestone: (goalId: string, title: string) => {
    return api.post(`/goals/${goalId}/milestones`, { title });
  },

  /**
   * PATCH /goals/:id/milestones/:mid
   */
  toggleMilestone: (goalId: string, milestoneId: string) => {
    return api.patch(`/goals/${goalId}/milestones/${milestoneId}`);
  },

  /**
   * DELETE /goals/:id/milestones/:mid
   */
  deleteMilestone: (goalId: string, milestoneId: string) => {
    return api.delete(`/goals/${goalId}/milestones/${milestoneId}`);
  },
};