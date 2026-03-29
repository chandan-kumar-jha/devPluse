import { api } from "./axios";
import type {
  Session,
  CreateSessionPayload,
  UpdateSessionPayload,
  Pagination,
  ListSessionsParams,
} from "../types/Sessions.type";

// ── Helper: normalise _id → id ────────────────────────────────────
const normalise = (raw: any): Session => ({
  ...raw,
  id: String(raw._id ?? raw.id),
});

const extractErrorMessage = (err: any, fallback: string): string => {
  const body = err?.response?.data;
  if (!body) return fallback;
  if (typeof body.message === "string") return body.message;
  if (Array.isArray(body.errors) && body.errors[0]?.message)
    return body.errors[0].message;
  if (typeof body === "string") return body;
  return fallback;
};

// ── GET /sessions ─────────────────────────────────────────────────
export const fetchSessions = async (
  params: ListSessionsParams = {}
): Promise<{ sessions: Session[]; pagination: Pagination }> => {
  try {
    const { data } = await api.get("sessions", { params });
    const sessions: Session[] = (data.data.sessions ?? []).map(normalise);
    return { sessions, pagination: data.data.pagination };
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to load sessions."));
  }
};

// ── GET /sessions/:id (FIXED TYPO) ────────────────────────────────
export const fetchSession = async (id: string): Promise<Session> => {
  try {
    // Removed the extra "]" bracket here
    const { data } = await api.get(`sessions/${id}`); 
    return normalise(data.data.session);
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to load session."));
  }
};

// ── POST /sessions (FIXED 400 ERROR) ──────────────────────────────
export const createSession = async (
  payload: CreateSessionPayload
): Promise<Session> => {
  try {
    // Clean data before sending to prevent Mongoose validation errors
    const cleanedPayload = {
      ...payload,
      goalId: payload.goalId?.trim() === "" ? null : payload.goalId,
      skillId: payload.skillId?.trim() === "" ? null : payload.skillId,
      duration: Number(payload.duration), // Ensure it's a number
    };

    const { data } = await api.post("sessions", cleanedPayload);
    return normalise(data.data.session);
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to create session."));
  }
};

// ── PATCH /sessions/:id ───────────────────────────────────────────
export const updateSession = async (
  id: string,
  payload: UpdateSessionPayload
): Promise<Session> => {
  try {
    // Apply same cleaning logic for updates
    const cleanedPayload = {
      ...payload,
      goalId: payload.goalId?.trim() === "" ? null : payload.goalId,
      skillId: payload.skillId?.trim() === "" ? null : payload.skillId,
    };

    const { data } = await api.patch(`sessions/${id}`, cleanedPayload);
    return normalise(data.data.session);
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to update session."));
  }
};

// ── DELETE /sessions/:id ──────────────────────────────────────────
export const deleteSession = async (id: string): Promise<void> => {
  try {
    await api.delete(`sessions/${id}`);
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Failed to delete session."));
  }
};