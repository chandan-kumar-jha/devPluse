import { motion } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, 
  Bell, Settings, LogOut, Clock, Plus,
  ChevronDown, Activity
} from "lucide-react";
import { Link, useNavigate } from "react-router";

export const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Simulate /auth/logout
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Terminal className="text-white h-5 w-5" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">DevTrack</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Overview</p>
          
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/50 text-white font-medium">
            <LayoutDashboard className="h-5 w-5 text-indigo-400" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 transition-colors font-medium">
            <Clock className="h-5 w-5" />
            Sessions
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 transition-colors font-medium">
            <Target className="h-5 w-5" />
            Goals
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 transition-colors font-medium">
            <Code2 className="h-5 w-5" />
            Skills
          </a>

          <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 mt-8">Account</p>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200 transition-colors font-medium">
            <Settings className="h-5 w-5" />
            Settings
          </a>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-zinc-400 hover:bg-zinc-800/30 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="h-5 w-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
             <Terminal className="text-indigo-500 h-6 w-6" />
          </div>
          
          <h1 className="text-lg font-semibold text-white hidden md:block">Welcome back, Developer</h1>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 border-2 border-zinc-950"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-zinc-800 cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
              <span className="text-sm font-medium hidden sm:block">dev_user</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Overview</h2>
                <p className="text-zinc-400 text-sm mt-1">Here's your productivity summary for this week.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Session
              </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Deep Work Hours", value: "32.5h", trend: "+2.4h this week", icon: <Clock className="h-5 w-5 text-indigo-400" /> },
                { label: "Goals Completed", value: "12", trend: "3 remaining", icon: <Target className="h-5 w-5 text-emerald-400" /> },
                { label: "Focus Score", value: "94%", trend: "+5% vs last week", icon: <Activity className="h-5 w-5 text-amber-400" /> },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-zinc-400 font-medium text-sm">{stat.label}</span>
                    <div className="p-2 bg-zinc-800 rounded-lg">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-500">{stat.trend}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 min-h-[300px] flex flex-col">
               <h3 className="font-semibold text-white mb-6">Recent Sessions</h3>
               <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-lg">
                  <Terminal className="h-8 w-8 mb-3 opacity-50" />
                  <p className="text-sm">No recent sessions found.</p>
                  <button className="text-indigo-400 text-sm font-medium mt-2 hover:text-indigo-300">Start tracking now</button>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
