import { NavLink } from "react-router-dom"
import { useAppSelector } from "../store/hooks"
import { useLogout } from "../hooks/useAuth"

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "⚡" },
  { to: "/sessions",  label: "Sessions",  icon: "🕐" },
  { to: "/goals",     label: "Goals",     icon: "🎯" },
  { to: "/skills",    label: "Skills",    icon: "📈" },
]

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user)
  const { mutate: logout } = useLogout()

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">

        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-800">
          <span className="text-xl font-bold tracking-tight text-white">Dev<span className="text-indigo-400">Pulse</span></span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            Sign out
          </button>
        </div>

      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

    </div>
  )
}

export default Layout