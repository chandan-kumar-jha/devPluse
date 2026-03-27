import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, Bell, Settings as SettingsIcon, LogOut, ChevronDown, User,
  Mail, Flame, TrendingUp, Trophy, CheckCircle2, Clock
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";

type Notification = {
  id: string;
  type: 'goal' | 'streak' | 'weekly' | 'skill';
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  { id: "1", type: "goal", title: "Goal Deadline Approaching", description: "Your goal 'Migrate DB to PostgreSQL' is due in 3 days. Need to log a session?", time: "2 hours ago", read: false },
  { id: "2", type: "streak", title: "Streak Broken Alert!", description: "Oh no! Your 14-day streak just ended. Log a quick session today to start a new one.", time: "Yesterday", read: false },
  { id: "3", type: "skill", title: "Skill Level-Up Notification", description: "Congratulations! You've reached Level 15 in React. Master tier is in sight.", time: "2 days ago", read: true },
  { id: "4", type: "weekly", title: "Weekly Progress Summary", description: "You logged 12 hours across 5 sessions last week. View your full report.", time: "1 week ago", read: true },
];

const getIcon = (type: string) => {
  switch(type) {
    case 'goal': return <Target className="h-5 w-5 text-blue-600" />;
    case 'streak': return <Flame className="h-5 w-5 text-orange-500" />;
    case 'skill': return <Trophy className="h-5 w-5 text-emerald-600" />;
    case 'weekly': return <TrendingUp className="h-5 w-5 text-purple-600" />;
    default: return <Bell className="h-5 w-5 text-slate-600" />;
  }
};

const getIconBg = (type: string) => {
  switch(type) {
    case 'goal': return 'bg-blue-50 border-blue-100';
    case 'streak': return 'bg-orange-50 border-orange-100';
    case 'skill': return 'bg-emerald-50 border-emerald-100';
    case 'weekly': return 'bg-purple-50 border-purple-100';
    default: return 'bg-slate-50 border-slate-100';
  }
};

export const Notifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => navigate("/");

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const filtered = notifications.filter(n => activeTab === 'all' || !n.read);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden md:flex flex-col z-20 relative">
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
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link to="/sessions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Clock className="h-5 w-5" /> Sessions
          </Link>
          <Link to="/goals" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Target className="h-5 w-5" /> Goals
          </Link>
          <Link to="/skills" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <Code2 className="h-5 w-5" /> Skills
          </Link>

          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-8">Account</p>
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <User className="h-5 w-5" /> Profile
          </Link>
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium">
            <SettingsIcon className="h-5 w-5" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
            <LogOut className="h-5 w-5" /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 flex-shrink-0">
          <div className="flex items-center md:hidden">
             <Terminal className="text-indigo-600 h-6 w-6" />
          </div>
          <div className="hidden md:flex items-center gap-3">
             <h1 className="text-lg font-semibold text-slate-800">In-app Notification Centre</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 bg-indigo-50 text-indigo-600 transition-colors rounded-full">
              <Bell className="h-5 w-5" />
              {notifications.some(n=>!n.read) && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-indigo-50"></span>}
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">
            
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
               <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
                 <button onClick={() => setActiveTab('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                 <button onClick={() => setActiveTab('unread')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${activeTab === 'unread' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                   Unread 
                   {notifications.filter(n=>!n.read).length > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">{notifications.filter(n=>!n.read).length}</span>}
                 </button>
               </div>
               <div className="flex gap-3">
                 <button onClick={markAllRead} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                   <CheckCircle2 className="h-4 w-4" /> Mark all as read
                 </button>
                 <Link to="/settings" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 pl-3 border-l border-slate-200">
                   <SettingsIcon className="h-4 w-4" /> Notification Preferences
                 </Link>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {filtered.map(notification => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                        key={notification.id} 
                        className={`p-5 flex gap-4 transition-colors relative group ${notification.read ? 'bg-white' : 'bg-indigo-50/30'}`}
                      >
                         {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>}
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0 mt-1 ${getIconBg(notification.type)}`}>
                            {getIcon(notification.type)}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-start justify-between gap-4 mb-1">
                             <h4 className={`text-base font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h4>
                             <span className="text-xs font-medium text-slate-400 whitespace-nowrap">{notification.time}</span>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed mb-3">{notification.description}</p>
                           {!notification.read && (
                             <button onClick={() => markRead(notification.id)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
                               Mark as read
                             </button>
                           )}
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {filtered.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                       <Mail className="h-12 w-12 text-slate-200 mb-4" />
                       <p className="text-lg font-medium text-slate-600">You're all caught up!</p>
                       <p className="text-sm mt-1">No {activeTab === 'unread' ? 'unread ' : ''}notifications right now.</p>
                    </div>
                  )}
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};