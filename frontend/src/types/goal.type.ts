// ============================================
// 📌 GOAL STATUS
// ============================================

export type GoalStatus = "active" | "done" | "archived";

// ============================================
// 📌 MILESTONE TYPES
// ============================================

export interface Milestone {
  _id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMilestonePayload {
  title: string;
}

// ============================================
// 📌 GOAL TYPES (MAIN — USED EVERYWHERE)
// ============================================

export interface Goal {
  _id: string;
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  status: GoalStatus;
  isPinned: boolean;
  milestones: Milestone[];
  progress: number;
  createdAt: string;
  updatedAt: string;
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

// ============================================
// 📌 API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface GetGoalsResponse {
  goals: Goal[];
  pagination: Pagination;
}

export interface GetGoalResponse {
  goal: Goal;
}

// ============================================
// 📌 QUERY PARAM TYPES
// ============================================

export interface GetGoalsParams {
  page?: number;
  limit?: number;
  status?: GoalStatus;
  category?: string;
  sort?: "newest" | "oldest" | "deadline" | "progress";
}

// ============================================
// 📌 UI TYPES (OPTIONAL — NOT USED IN COMPONENTS)
// ============================================

/**
 * ⚠️ IMPORTANT:
 * DO NOT use this in current components
 * Only use when you want lightweight UI transformation
 */
export interface UIGoal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  category?: string;
  status: GoalStatus;
  isPinned: boolean;
  progress: number;
  completedMilestones: number;
  totalMilestones: number;
}

// ============================================
// 📌 MAPPERS (OPTIONAL)
// ============================================

export const mapGoalToUI = (goal: Goal): UIGoal => {
  const completed = goal.milestones.filter((m) => m.completed).length;

  return {
    id: goal._id,
    title: goal.title,
    description: goal.description,
    deadline: goal.deadline,
    category: goal.category,
    status: goal.status,
    isPinned: goal.isPinned,
    progress: goal.progress,
    completedMilestones: completed,
    totalMilestones: goal.milestones.length,
  };
};



export const mapGoalsToUI = (goals: Goal[]): UIGoal[] => {
  return goals.map(mapGoalToUI);
};