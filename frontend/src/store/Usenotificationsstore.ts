// store/useNotificationsStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  fetchNotifications,
  fetchPreferences,
  updatePreferences,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
  type Pagination,
  type PreferencesData,
} from "../api/notifications.api";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface NotificationsState {
  // Data
  notifications: Notification[];
  unreadCount: number;
  pagination: Pagination | null;
  preferences: PreferencesData | null;

  // UI
  loadingNotifications: boolean;
  loadingPreferences: boolean;
  updatingPreferences: boolean;
  markingAllRead: boolean;
  error: string | null;

  // Actions
  loadNotifications: (page?: number, limit?: number) => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePrefs: (prefs: Partial<PreferencesData>) => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
  clearError: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      // ── Initial State ──────────────────────────────────────────────────────
      notifications: [],
      unreadCount: 0,
      pagination: null,
      preferences: null,

      loadingNotifications: false,
      loadingPreferences: false,
      updatingPreferences: false,
      markingAllRead: false,
      error: null,

      // ── Actions ────────────────────────────────────────────────────────────

      /** Fetch paginated notifications from the backend */
      loadNotifications: async (page = 1, limit = 20) => {
        set({ loadingNotifications: true, error: null });
        try {
          const res = await fetchNotifications(page, limit);
          set({
            notifications: res.data.notifications,
            unreadCount: res.data.unreadCount,
            pagination: res.data.pagination,
            loadingNotifications: false,
          });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load notifications";
          set({ error: message, loadingNotifications: false });
        }
      },

      /** Fetch notification preferences */
      loadPreferences: async () => {
        set({ loadingPreferences: true, error: null });
        try {
          const res = await fetchPreferences();
          set({ preferences: res.data.preferences, loadingPreferences: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load preferences";
          set({ error: message, loadingPreferences: false });
        }
      },

      /** PATCH preferences; optimistic update + rollback on error */
      updatePrefs: async (prefs: Partial<PreferencesData>) => {
        const previous = get().preferences;
        // Optimistic update
        if (previous) {
          set({ preferences: { ...previous, ...prefs } });
        }
        set({ updatingPreferences: true, error: null });
        try {
          const res = await updatePreferences(prefs);
          set({
            preferences: res.data.preferences,
            updatingPreferences: false,
          });
        } catch (err: unknown) {
          // Rollback
          set({ preferences: previous, updatingPreferences: false });
          const message =
            err instanceof Error ? err.message : "Failed to update preferences";
          set({ error: message });
        }
      },

      /** Mark every notification as read */
      markAllRead: async () => {
        set({ markingAllRead: true, error: null });
        try {
          await markAllNotificationsRead();
          set((state) => ({
            notifications: state.notifications.map((n) => ({
              ...n,
              read: true,
            })),
            unreadCount: 0,
            markingAllRead: false,
          }));
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to mark notifications as read";
          set({ error: message, markingAllRead: false });
        }
      },

      /** Mark a single notification as read (optimistic) */
      markOneRead: async (id: string) => {
        // Optimistic
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
        try {
          await markNotificationRead(id);
        } catch (err: unknown) {
          // Rollback single item
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: false } : n
            ),
            unreadCount: state.unreadCount + 1,
          }));
          const message =
            err instanceof Error
              ? err.message
              : "Failed to mark notification as read";
          set({ error: message });
        }
      },

      clearError: () => set({ error: null }),
    }),
    { name: "NotificationsStore" }
  )
);