import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Skills } from "./pages/Skills";
import { Goals } from "./pages/Goals";
import { Sessions } from "./pages/Sessions";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";
import { Layout } from "./layout/Layout";

export const router = createBrowserRouter([
  // ── Public Routes ────────────────────────────────
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },

  // ── Protected Routes (Wrapped in Layout) ─────────
  {
    path: "/",
    Component: Layout, // This is the parent
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "skills",
        Component: Skills,
      },
      {
        path: "goals",
        Component: Goals,
      },
      {
        path: "sessions",
        Component: Sessions,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: "notifications",
        Component: Notifications,
      },
    ],
  },
]);