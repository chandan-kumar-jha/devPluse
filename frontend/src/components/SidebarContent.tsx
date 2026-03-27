import { Link } from 'react-router';
import { 
  Terminal, LayoutDashboard, Target, Code2, 
  Settings, LogOut, Clock 
} from 'lucide-react';
import { type UseMutationResult } from '@tanstack/react-query';

// 1. User Interface
interface User {
  name: string;
  username: string;
  email?: string;
  avatar?: string;
}

// 2. Auth API Response Type (adjust based on your backend)
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
  // 3. Proper Typing for the Mutation
  logoutMutation: Pick<
    UseMutationResult<LogoutResponse, Error, void, unknown>, 
    'mutate' | 'isPending'
  >;
}

export const SidebarContent = ({ 
  user, 
  location, 
  setIsMobileMenuOpen, 
  logoutMutation 
}: SidebarProps) => {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* ... rest of your JSX remains the same ... */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Terminal className="text-white h-5 w-5" />
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">DevPulse</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Overview</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : ''}`} />
              {item.label}
            </Link>
          );
        })}

        <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
        <Link
          to="/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
            location.pathname === '/settings' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-200">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">@{user.username}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );
};