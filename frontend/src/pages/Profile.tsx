import { useState } from "react";
import { motion } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, Bell, Settings as SettingsIcon, LogOut, Plus, ChevronDown, User,
  Camera, MapPin, Globe, Clock, Calendar, Activity, CheckCircle2, Trophy
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => navigate("/");

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

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
          <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium transition-colors">
            <User className="h-5 w-5 text-indigo-600" /> Profile
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
             <h1 className="text-lg font-semibold text-slate-800">User Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Banner & Avatar Upload */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
               <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
               <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12">
                  <div className="relative group cursor-pointer">
                     <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg overflow-hidden">
                        {/* Placeholder for avatar image */}
                     </div>
                     <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-6 w-6 text-white" />
                     </div>
                     <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                        <Plus className="h-4 w-4 text-indigo-600" />
                     </div>
                  </div>
                  <div className="text-center sm:text-left flex-1 mb-2">
                     <h2 className="text-2xl font-bold text-slate-800">Jane Developer</h2>
                     <p className="text-slate-500">Full Stack Engineer</p>
                  </div>
                  <button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-indigo-100">
                    View Public Profile
                  </button>
               </div>
            </div>

            {/* Lifetime Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Calendar className="h-6 w-6" /></div>
                 <div>
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined Date</p>
                   <p className="text-xl font-bold text-slate-800">Oct 2024</p>
                 </div>
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity className="h-6 w-6" /></div>
                 <div>
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lifetime Sessions</p>
                   <p className="text-xl font-bold text-slate-800">342</p>
                 </div>
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                 <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Trophy className="h-6 w-6" /></div>
                 <div>
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Skills Mastered</p>
                   <p className="text-xl font-bold text-slate-800">12</p>
                 </div>
               </div>
            </div>

            {/* Edit Profile Form */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSave} 
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-8"
            >
               <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">View & Edit Profile</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                       <input type="text" defaultValue="Jane Developer" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Current Role</label>
                       <input type="text" defaultValue="Full Stack Engineer" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" /> GitHub Username Link</label>
                       <div className="flex">
                         <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-500 text-sm">github.com/</span>
                         <input type="text" defaultValue="janedev" className="flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                       </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                       <textarea rows={4} defaultValue="Building awesome web apps and mastering React. Always learning." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> Timezone Preference</label>
                       <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 appearance-none cursor-pointer">
                         <option>Pacific Time (PT)</option>
                         <option>Eastern Time (ET)</option>
                         <option>Central European Time (CET)</option>
                         <option>Coordinated Universal Time (UTC)</option>
                       </select>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  {isSaved && (
                    <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-emerald-600 flex items-center gap-1.5 text-sm font-medium mr-2">
                      <CheckCircle2 className="h-4 w-4" /> Profile updated
                    </motion.span>
                  )}
                  <button type="button" className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">Save Changes</button>
               </div>
            </motion.form>

          </div>
        </div>
      </main>
    </div>
  );
};