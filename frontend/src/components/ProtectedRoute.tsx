import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
  return (
    <div className="h-screen flex items-center justify-center text-white">
      Loading...
    </div>
  );
}

  // ❌ not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 🔥 FIX: avoid infinite loop
  const isOnCompleteProfile = location.pathname === "/complete-profile";

  if (
    (!user.username || user.username.startsWith("user_")) &&
    !isOnCompleteProfile
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};