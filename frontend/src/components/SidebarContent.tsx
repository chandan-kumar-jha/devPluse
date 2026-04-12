import { Link } from 'react-router';
import { 
  Terminal, LayoutDashboard, Target, Code2, 
  Settings, LogOut, Clock , Bell
} from 'lucide-react';
import { type UseMutationResult } from '@tanstack/react-query';

// ── TYPES ─────────────────────────────────────────────
interface User {
  name: string;
  username: string;
  email?: string;
  avatarUrl?: string; // ✅ FIXED
}

interface LogoutResponse {
  message: string;
  success: boolean;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sessions', label: 'Sessions', icon: Clock },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/skills', label: 'Skills', icon: Code2 },
];

interface SidebarProps {
  user: User | null;
  location: { pathname: string };
  setIsMobileMenuOpen: (open: boolean) => void;
  logoutMutation: Pick<
    UseMutationResult<LogoutResponse, Error, void, unknown>, 
    'mutate' | 'isPending'
  >;
}

// ── COMPONENT ─────────────────────────────────────────
export const SidebarContent = ({ 
  user, 
  location, 
  setIsMobileMenuOpen, 
  logoutMutation 
}: SidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-white">

      {/* LOGO */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Terminal className="text-white h-5 w-5" />
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">
            DevPulse
          </span>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">

        <p className="px-2 text-xs font-semibold text-slate-400 uppercase mb-4">
          Overview
        </p>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        {/* ACCOUNT */}
        <p className="px-2 text-xs font-semibold text-slate-400 uppercase mt-8 mb-4">
          Account
        </p>

        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${
            location.pathname === '/settings'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>

        <Link
          to="/notifications"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium ${
            location.pathname === '/notifications'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Bell className="h-5 w-5" />
          Notifications
        </Link>
      </nav>

      {/* USER + LOGOUT */}
      <div className="p-4 border-t border-slate-200">

        {/* ✅ CLICKABLE PROFILE */}
        {user && (
          <Link to="/profile">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition cursor-pointer">

              {/* AVATAR */}
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {user.name?.[0] || "U"}
                </div>
              )}

              {/* NAME */}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500">
                  @{user.username}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* LOGOUT */}
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full mt-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition font-medium disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );
};