
export type DateRange = "7d" | "30d" | "90d";

export interface DashboardStats {
  totalSessions: number;
  totalHours: number;
  activeGoals: number;
  completedGoals: number;
  totalSkills: number;
}

export interface Streak {
  current: number;
  longest: number;
  lastSessionDate: string;
}

export interface SessionsPerWeek {
  name: string;
  sessions: number;
  duration: number;
}

export interface GoalStatus {
  name: string;
  value: number;
  color: string;
}

export interface SkillTier {
  _id: string;
  count: number;
}

export interface Charts {
  sessionsPerWeek: SessionsPerWeek[];
  goalStatus: GoalStatus[];
  skillTiers: SkillTier[];
}

export interface RecentSession {
  _id: string;
  title: string;
  duration: number;
  date: string;
  tags: string[];
}

export interface PinnedGoal {
  _id: string;
  title: string;
  progress: number;
  deadline?: string;
  color?: string;
}

export interface Widgets {
  recentSessions: RecentSession[];
  pinnedGoals: PinnedGoal[];
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface DashboardData {
  stats: DashboardStats;
  streak: Streak;
  charts: Charts;
  widgets: Widgets;
  heatmap: HeatmapEntry[];
  dateRange: string;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}
