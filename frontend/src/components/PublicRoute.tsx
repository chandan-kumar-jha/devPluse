import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export default function PublicRoute() {
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}