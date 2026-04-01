// store/useDashboardStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fetchDashboard } from "../api/dashboard.api"; 

// 2. Import the types directly from your types file
import type { 
  DateRange, 
  DashboardData 
} from "../types/dashboard.type"; 

interface DashboardState {
  data: DashboardData | null;
  dateRange: DateRange;
  loading: boolean;
  error: string | null;

  loadDashboard: (range?: DateRange) => Promise<void>;
  setDateRange: (range: DateRange) => void;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      data: null,
      dateRange: "30d",
      loading: false,
      error: null,

      loadDashboard: async (range?: DateRange) => {
        const activeRange = range ?? get().dateRange;
        set({ loading: true, error: null });
        try {
          const res = await fetchDashboard(activeRange);
          set({ data: res.data, loading: false });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Failed to load dashboard";
          set({ error: message, loading: false });
        }
      },

      setDateRange: (range: DateRange) => {
        set({ dateRange: range });
        get().loadDashboard(range);
      },

      clearError: () => set({ error: null }),
    }),
    { name: "DashboardStore" }
  )
);