import { motion } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, 
  Bell, Settings, LogOut, Clock, ChevronDown, 
  Calendar as CalendarIcon
} from "lucide-react";
import { Link, useNavigate, Outlet, useLocation } from "react-router";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => navigate("/login");

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/sessions", label: "Sessions", icon: Clock },
    { path: "/goals", label: "Goals", icon: Target },
    { path: "/skills", label: "Skills", icon: Code2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Terminal className="text-white h-5 w-5" />
            </div>
            <span className="text-slate-900 font-bold text-lg tracking-tight">DevTrack</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : ""}`} />
                {item.label}
              </Link>
            );
          })}

          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
          <Link to='/settings' className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${location.pathname === '/settings' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Settings className="h-5 w-5" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden"><Terminal className="text-indigo-600 h-6 w-6" /></div>
          <div className="hidden md:flex items-center gap-3"><h1 className="text-lg font-semibold text-slate-800">Welcome back, Developer</h1></div>
          <div className="flex items-center gap-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
              <CalendarIcon className="h-4 w-4" /> Last 7 Days <ChevronDown className="h-3 w-3 ml-1" />
            </motion.button>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" /><span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
            </div>
          </div>
        </header>

        {/* This is where the Dashboard, Skills, Goals, etc. will render */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           <Outlet />
        </div>
      </main>
    </div>
  );
};