import { useState } from "react";
import { motion } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, Bell, Settings as SettingsIcon, LogOut, ChevronDown, User,
  Moon, Sun, Download, Database, AlertTriangle, Link2, Lock, Mail,  Clock
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { FaGithub } from "react-icons/fa";

export const Settings = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => navigate("/");

  const [theme, setTheme] = useState("light");
  const [emails, setEmails] = useState({ deadline: true, streak: true, weekly: false });
  const [privacy, setPrivacy] = useState({ publicProfile: true, shareActivity: false });

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
          <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-700 font-medium transition-colors">
            <SettingsIcon className="h-5 w-5 text-indigo-600" /> Settings
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
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center md:hidden">
             <Terminal className="text-indigo-600 h-6 w-6" />
          </div>
          <div className="hidden md:flex items-center gap-3">
             <h1 className="text-lg font-semibold text-slate-800">Account Settings</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
            </Link>
            <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Link>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Appearance Section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   {theme === 'light' ? <Sun className="h-5 w-5 text-indigo-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
                   Appearance
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">Dark / light mode preferences.</p>
               </div>
               <div className="p-6">
                  <div className="flex gap-4">
                     <button onClick={() => setTheme('light')} className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'light' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                        <Sun className="h-8 w-8" />
                        <span className="font-semibold">Light Mode</span>
                     </button>
                     <button onClick={() => setTheme('dark')} className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${theme === 'dark' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                        <Moon className="h-8 w-8" />
                        <span className="font-semibold">Dark Mode</span>
                     </button>
                  </div>
               </div>
            </motion.div>

            {/* Notifications Preferences */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                 <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   <Mail className="h-5 w-5 text-indigo-500" /> Notification Settings
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">Manage what we email you about.</p>
               </div>
               <div className="p-6 space-y-4">
                  {[
                    { key: 'deadline', label: 'Goal deadline email reminder', desc: 'Get notified 3 days before a goal deadline.' },
                    { key: 'streak', label: 'Streak broken alert', desc: 'Get an alert if your daily streak is about to end.' },
                    { key: 'weekly', label: 'Weekly progress summary email', desc: 'A recap of your sessions and XP earned.' }
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-200 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                          <input type="checkbox" checked={emails[item.key as keyof typeof emails]} onChange={() => setEmails(e => ({...e, [item.key]: !e[item.key as keyof typeof emails]}))} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-indigo-500 checked:bg-indigo-500 transition-all duration-300" style={{ right: emails[item.key as keyof typeof emails] ? '0' : '1.25rem' }}/>
                          <div className={`toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer ${emails[item.key as keyof typeof emails] ? 'bg-indigo-200' : ''}`}></div>
                      </div>
                    </label>
                  ))}
               </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Privacy & Accounts */}
              <div className="space-y-8">
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Lock className="h-5 w-5 text-indigo-500" /> Privacy Settings</h2>
                   </div>
                   <div className="p-6 space-y-4">
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Make profile public</span>
                        <input type="checkbox" checked={privacy.publicProfile} onChange={() => setPrivacy(p => ({...p, publicProfile: !p.publicProfile}))} className="accent-indigo-600 h-4 w-4" />
                      </label>
                      <label className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Share activity on feed</span>
                        <input type="checkbox" checked={privacy.shareActivity} onChange={() => setPrivacy(p => ({...p, shareActivity: !p.shareActivity}))} className="accent-indigo-600 h-4 w-4" />
                      </label>
                   </div>
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Link2 className="h-5 w-5 text-indigo-500" /> Connected Accounts</h2>
                   </div>
                   <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                         <div className="flex items-center gap-3">
                           <FaGithub className="h-5 w-5 text-slate-800" />
                           <span className="text-sm font-medium text-slate-700">GitHub</span>
                         </div>
                         <button className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors">Disconnect</button>
                      </div>
                      <button className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                         + Connect New Account
                      </button>
                   </div>
                 </motion.div>
              </div>

              {/* Data & Danger Zone */}
              <div className="space-y-8">
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Database className="h-5 w-5 text-indigo-500" /> Export All Data — JSON / CSV</h2>
                   </div>
                   <div className="p-6">
                      <p className="text-sm text-slate-500 mb-6">Download a copy of all your sessions, goals, and skills data. Your data is yours.</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                          <Download className="h-4 w-4" /> CSV Format
                        </button>
                        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                          <Database className="h-4 w-4" /> JSON Format
                        </button>
                      </div>
                   </div>
                 </motion.div>

                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden">
                   <div className="p-6 border-b border-red-200/60">
                     <h2 className="text-lg font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Danger Zone — Delete Account</h2>
                   </div>
                   <div className="p-6">
                      <p className="text-sm text-red-600 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors">
                        Permanently Delete Account
                      </button>
                   </div>
                 </motion.div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};