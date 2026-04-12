import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

export const PublicRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null; // prevent flicker

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};