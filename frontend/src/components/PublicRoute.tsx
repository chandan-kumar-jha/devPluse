import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/useAuthStore";
export const PublicRoute = () => {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};