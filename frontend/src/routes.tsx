import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register/index";
import { Dashboard } from "./pages/Dashboard/index";
import { Skills } from "./pages/Skills";
import { Goals } from "./pages/Goals";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Notifications } from "./pages/Notifications";
import { Sessions } from "./pages/Sessions/Sessions";
import { Layout } from "./layout/Layout";
export const router = createBrowserRouter([
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
  {
    /* Yahan magic hota hai: Layout ko main wrapper banate hain.
       Saare protected routes iske children honge.
    */
    path: "/",
    Component: Layout, 
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