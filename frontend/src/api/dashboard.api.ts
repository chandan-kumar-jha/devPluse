// lib/api/dashboardApi.ts
import {api} from './axios'
// ─── Types ────────────────────────────────────────────────────────────────────
import  type{ DashboardResponse, DateRange } from '../types/dashboard.type';
// ─── API ──────────────────────────────────────────────────────────────────────

export const fetchDashboard = async (
  range: DateRange = "30d"
): Promise<DashboardResponse> => {
  const { data } = await api.get<DashboardResponse>("/dashboard", {
    params: { range },
  });
  return data;
};

export default api;