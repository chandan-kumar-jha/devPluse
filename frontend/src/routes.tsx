import { createBrowserRouter } from "react-router";

import { Home } from "./pages/Home";
import { Register } from "./pages/Register/index";
import { Dashboard } from "./pages/Dashboard";
import { Skills } from "./pages/Skills";
import { Goals } from "./pages/Goals";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";
import { Sessions } from "./pages/Sessions";
import { Layout } from "./layout/Layout";
import { CompleteProfile } from "./pages/CompleteProfile";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
export const router = createBrowserRouter([
  // 🌐 PUBLIC
  {
    path: "/",
    element: <Home />,
  },

  // 🔓 PUBLIC ROUTES
  {
    element: <PublicRoute />, // ✅ wrapper
    children: [
      {
        path: "/register",
        element: <Register />, // ✅ NO wrapper here
      },
    ],
  },

  // 🔐 PROTECTED ROUTES
  {
    element: <ProtectedRoute />, // ✅ wrapper
    children: [
      {
        path: "/complete-profile",
        element: <CompleteProfile />,
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "skills", element: <Skills /> },
          { path: "goals", element: <Goals /> },
          { path: "sessions", element: <Sessions /> },
          { path: "settings", element: <Settings /> },
          { path: "profile", element: <Profile /> },
          { path: "notifications", element: <Notifications /> },
        ],
      },
    ],
  },
]);