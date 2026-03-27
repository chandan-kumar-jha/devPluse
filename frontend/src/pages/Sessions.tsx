import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, LayoutDashboard, Target, Code2, Bell, Settings as SettingsIcon, LogOut, Plus, ChevronDown, User,
  Search, Filter, Clock, Play, Square, Download, Repeat, Edit2, Trash2, Calendar, Tag as TagIcon, CheckCircle2, X, Flame
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router";

type Session = {
  id: string;
  title: string;
  duration: number; // minutes
  date: string;
  notes: string;
  tags: string[];
  goalId?: string;
  skillId?: string;
};

const mockSessions: Session[] = [
  { id: "1", title: "React Auth Refactor", duration: 120, date: "2026-03-25", notes: "Refactored the login flow to use JWT tokens.", tags: ["Frontend", "Security"], skillId: "React", goalId: "Legacy Refactor" },
  { id: "2", title: "DB Migration Script", duration: 90, date: "2026-03-24", notes: "Wrote staging migration script for PostgreSQL.", tags: ["Backend", "Database"], skillId: "PostgreSQL", goalId: "Migrate DB" },
  { id: "3", title: "System Design Reading", duration: 60, date: "2026-03-22", notes: "Read chapter 3 of DDIA.", tags: ["Learning", "Architecture"], skillId: "Architecture", goalId: "Interview Prep" },
];

export const Sessions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = () => navigate("/");

  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setIsLogModalOpen(true);
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
  }, [sessions, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
     

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">
        

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
             
             {/* Top Widgets Panel */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Live Timer Widget */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                   <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Live Session Timer</h3>
                   <div className="text-4xl font-mono font-bold text-slate-800 mb-4 tracking-tighter">
                     {formatTime(timerSeconds)}
                   </div>
                   <div className="flex gap-3 w-full">
                      {!isTimerRunning ? (
                        <button onClick={() => setIsTimerRunning(true)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                          <Play className="h-4 w-4" /> Start
                        </button>
                      ) : (
                        <button onClick={handleStopTimer} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors animate-pulse">
                          <Square className="h-4 w-4" /> Stop & Save
                        </button>
                      )}
                   </div>
                </div>

                {/* Streak Tracking */}
                <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                   <div className="flex justify-between items-start relative z-10">
                     <h3 className="font-semibold text-orange-100">Daily Streak</h3>
                     <Flame className="h-6 w-6 text-white" />
                   </div>
                   <div className="relative z-10 mt-4">
                     <div className="text-4xl font-bold">14 Days</div>
                     <p className="text-sm text-orange-100 mt-1">Keep it up! Personal best: 21</p>
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 justify-center">
                   <button onClick={() => setIsLogModalOpen(true)} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-indigo-100">
                     <Plus className="h-4 w-4" /> Log a Session
                   </button>
                   <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-slate-200">
                     <Repeat className="h-4 w-4" /> Recurring Templates
                   </button>
                   <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors border border-slate-200">
                     <Download className="h-4 w-4" /> Export to CSV
                   </button>
                </div>
             </div>

             {/* Sessions List */}
             <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
                   <div className="relative w-full sm:w-72">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       type="text" placeholder="Search sessions by keyword..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                     />
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Calendar className="h-4 w-4" /> Date
                     </button>
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <TagIcon className="h-4 w-4" /> Tag
                     </button>
                   </div>
                </div>

                <div className="divide-y divide-slate-100">
                   {filteredSessions.map(session => (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={session.id} className="p-4 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center group">
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-slate-800">{Math.floor(session.duration/60)}h {session.duration%60}m</p>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{session.date}</p>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-lg text-slate-800 mb-1">{session.title}</h4>
                           <p className="text-sm text-slate-600 mb-3 truncate">{session.notes}</p>
                           <div className="flex flex-wrap items-center gap-2">
                              {session.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">#{tag}</span>
                              ))}
                              {session.goalId && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><Target className="h-3 w-3" /> {session.goalId}</span>}
                              {session.skillId && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><Code2 className="h-3 w-3" /> {session.skillId}</span>}
                           </div>
                        </div>

                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit a session">
                             <Edit2 className="h-4 w-4" />
                           </button>
                           <button onClick={() => deleteSession(session.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete a session">
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                     </motion.div>
                   ))}
                   {filteredSessions.length === 0 && (
                     <div className="p-12 text-center text-slate-500">
                        <Search className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                        <p>No sessions found matching your criteria.</p>
                     </div>
                   )}
                </div>
             </div>

          </div>
        </div>
      </main>

      {/* Log Session Modal Overlay */}
      <AnimatePresence>
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Plus className="h-5 w-5 text-indigo-600" /> Log a Session</h2>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-6 space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                       <input type="text" placeholder="What did you work on?" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes)</label>
                       <input type="number" defaultValue={Math.floor(timerSeconds / 60)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                       <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                       <textarea rows={2} placeholder="Add any details, reflections, or bugs encountered..." className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma separated)</label>
                       <input type="text" placeholder="e.g. Frontend, React, Bugfix" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                     </div>
                     
                     {/* Links */}
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Link to a Goal</label>
                       <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600">
                         <option>None</option>
                         <option>Master React Native</option>
                         <option>Migrate DB</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Link to a Skill</label>
                       <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600">
                         <option>None</option>
                         <option>React</option>
                         <option>TypeScript</option>
                         <option>PostgreSQL</option>
                       </select>
                     </div>
                   </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setIsLogModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                  <button onClick={() => { setIsLogModalOpen(false); setTimerSeconds(0); }} className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Save Session
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};