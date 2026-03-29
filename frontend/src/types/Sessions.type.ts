// ── Domain types (mirror Mongoose ISession) ───────────────────────
export type Session = {
  id: string;         // mapped from _id on the way in
  _id?: string;       // raw from API
  title: string;
  duration: number;   // 1–1440 minutes
  date: string;       // ISO string
  notes?: string;
  tags: string[];     // max 10
  goalId?: string | null;
  skillId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// ── Form state ────────────────────────────────────────────────────
export type FormData = {
  title: string;
  duration: number;
  date: string;
  notes: string;
  tags: string[];
  goalId: string;
  skillId: string;
};

// ── API payload shapes ─────────────────────────────────────────────
export type CreateSessionPayload = {
  title: string;
  duration: number;
  date: string;
  notes?: string;
  tags?: string[];
  goalId?: string;
  skillId?: string;
};

export type UpdateSessionPayload = Partial<CreateSessionPayload>;

// ── Pagination ────────────────────────────────────────────────────
export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// ── List query params ─────────────────────────────────────────────
export type ListSessionsParams = {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: "newest" | "oldest" | "longest" | "shortest";
};