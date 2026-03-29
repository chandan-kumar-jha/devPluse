import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Session,
  Pagination,
  ListSessionsParams,
  CreateSessionPayload,
  UpdateSessionPayload,
} from "../types/Sessions.type";
import * as sessionApi from "../api/sessions.api";

// ── State shape ───────────────────────────────────────────────────
type SessionState = {
  // Server data
  sessions: Session[];
  pagination: Pagination | null;

  // UI / request state
  isLoading: boolean;
  isSaving: boolean;        // create or update in-flight
  isDeleting: string | null; // id of the session being deleted

  // Inline client-side filter state (search & tag filter live in the
  // component so they don't pollute the store; the store holds the
  // last params used so we can refetch if needed)
  lastParams: ListSessionsParams;

  error: string | null;
};

// ── Actions shape ─────────────────────────────────────────────────
type SessionActions = {
  fetchSessions: (params?: ListSessionsParams) => Promise<void>;
  createSession: (payload: CreateSessionPayload) => Promise<Session>;
  updateSession: (id: string, payload: UpdateSessionPayload) => Promise<Session>;
  deleteSession: (id: string) => Promise<void>;
  clearError: () => void;
};

// ── Initial state ─────────────────────────────────────────────────
const initialState: SessionState = {
  sessions: [],
  pagination: null,
  isLoading: false,
  isSaving: false,
  isDeleting: null,
  lastParams: {},
  error: null,
};

// ── Store ─────────────────────────────────────────────────────────
export const useSessionStore = create<SessionState & SessionActions>()(
  immer((set, get) => ({
    ...initialState,

    // ── fetchSessions ──────────────────────────────────────────────
    fetchSessions: async (params: ListSessionsParams = {}) => {
      set((s) => {
        s.isLoading = true;
        s.error = null;
        s.lastParams = params;
      });
      try {
        const { sessions, pagination } = await sessionApi.fetchSessions(params);
        set((s) => {
          s.sessions = sessions;
          s.pagination = pagination;
        });
      } catch (err: any) {
        set((s) => {
          s.error =
            err?.response?.data?.message ?? "Failed to load sessions.";
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

    // ── createSession ──────────────────────────────────────────────
    createSession: async (payload: CreateSessionPayload) => {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });
      try {
        const session = await sessionApi.createSession(payload);
        set((s) => {
          // Optimistically prepend — newest first
          s.sessions.unshift(session);
          if (s.pagination) s.pagination.total += 1;
        });
        return session;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to create session.";
        set((s) => {
          s.error = message;
        });
        throw new Error(message);
      } finally {
        set((s) => {
          s.isSaving = false;
        });
      }
    },

    // ── updateSession ──────────────────────────────────────────────
    updateSession: async (id: string, payload: UpdateSessionPayload) => {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });
      try {
        const updated = await sessionApi.updateSession(id, payload);
        set((s) => {
          const idx = s.sessions.findIndex((x) => x.id === id);
          if (idx !== -1) s.sessions[idx] = updated;
        });
        return updated;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to update session.";
        set((s) => {
          s.error = message;
        });
        throw new Error(message);
      } finally {
        set((s) => {
          s.isSaving = false;
        });
      }
    },

    // ── deleteSession ──────────────────────────────────────────────
    deleteSession: async (id: string) => {
      set((s) => {
        s.isDeleting = id;
        s.error = null;
      });
      try {
        await sessionApi.deleteSession(id);
        set((s) => {
          s.sessions = s.sessions.filter((x) => x.id !== id);
          if (s.pagination) s.pagination.total -= 1;
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.message ?? "Failed to delete session.";
        set((s) => {
          s.error = message;
        });
        throw new Error(message);
      } finally {
        set((s) => {
          s.isDeleting = null;
        });
      }
    },

    // ── clearError ────────────────────────────────────────────────
    clearError: () =>
      set((s) => {
        s.error = null;
      }),
  }))
);