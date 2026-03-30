import { api } from "./axios";
export type NotificationType = "goal" | "streak" | "weekly" | "skill";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationsListResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    unreadCount: number;
    pagination: Pagination;
  };
}

export interface PreferencesData {
  skill_levelup: boolean;
  goal_deadline: boolean;
  streak_broken: boolean;
}

export interface PreferencesResponse {
  success: boolean;
  data: { preferences: PreferencesData };
}

export interface UpdatePreferencesResponse {
  success: boolean;
  message: string;
  data: { preferences: PreferencesData };
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * GET /notifications?page=1&limit=20
 */
export const fetchNotifications = async (
  page = 1,
  limit = 20
): Promise<NotificationsListResponse> => {
  const { data } = await api.get<NotificationsListResponse>("/notifications", {
    params: { page, limit },
  });
  return data;
};

/**
 * GET /notifications/preferences
 */
export const fetchPreferences = async (): Promise<PreferencesResponse> => {
  const { data } = await api.get<PreferencesResponse>(
    "/notifications/preferences"
  );
  return data;
};

/**
 * PATCH /notifications/preferences
 */
export const updatePreferences = async (
  prefs: Partial<PreferencesData>
): Promise<UpdatePreferencesResponse> => {
  const { data } = await api.patch<UpdatePreferencesResponse>(
    "/notifications/preferences",
    prefs
  );
  return data;
};

/**
 * PATCH /notifications/mark-all-read
 */
export const markAllNotificationsRead =
  async (): Promise<MarkAllReadResponse> => {
    const { data } = await api.patch<MarkAllReadResponse>(
      "/notifications/mark-all-read"
    );
    return data;
  };

/**
 * PATCH /notifications/:id/read  — mark a single notification as read
 * Add this endpoint to your backend if needed; currently used client-side only.
 */
export const markNotificationRead = async (
  id: string
): Promise<{ success: boolean }> => {
  const { data } = await api.patch<{ success: boolean }>(
    `/notifications/${id}/read`
  );
  return data;
};

export default api;