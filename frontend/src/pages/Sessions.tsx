import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Terminal, Target, Code2, Bell, Plus, ChevronDown, 
  Search, Clock, Play, Square, Download, Repeat, Edit2, Trash2, 
  Calendar, Tag as TagIcon, CheckCircle2, X, Flame, RotateCcw
} from "lucide-react";
import { Link } from "react-router";

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
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  // Timer State Logic
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef(0);

  useEffect(() => {
    let animationFrame: number;

    const updateTimer = () => {
      if (isTimerRunning && startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setTimerSeconds(accumulatedTimeRef.current + elapsed);
        animationFrame = requestAnimationFrame(updateTimer);
      }
    };

    if (isTimerRunning) {
      startTimeRef.current = Date.now();
      animationFrame = requestAnimationFrame(updateTimer);
    } else {
      accumulatedTimeRef.current = timerSeconds;
      startTimeRef.current = null;
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isTimerRunning]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    accumulatedTimeRef.current = 0;
  };

  const deleteSession = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [sessions, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center md:hidden">
             <Terminal className="text-indigo-600 h-6 w-6" />
          </div>
          <div className="hidden md:flex items-center gap-3">
             <h1 className="text-lg font-bold text-slate-800 tracking-tight">Coding Sessions</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer group">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-sm" />
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
             
             {/* Top Widgets Panel */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Live Timer Widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center text-center">
                   <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Live Session Timer</h3>
                   <div className="text-5xl font-mono font-bold text-slate-900 mb-6 tracking-tighter tabular-nums">
                     {formatTime(timerSeconds)}
                   </div>
                   
                   <div className="flex flex-col gap-3 w-full">
                      <div className="flex gap-3 w-full">
                        {!isTimerRunning ? (
                          <button 
                            onClick={() => setIsTimerRunning(true)} 
                            className="flex-1 bg-[#10B981] hover:bg-emerald-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                          >
                            <Play className="h-4 w-4 fill-current" /> {timerSeconds > 0 ? 'Resume' : 'Start'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => setIsTimerRunning(false)} 
                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-100"
                          >
                            <Square className="h-4 w-4 fill-current" /> Pause
                          </button>
                        )}

                        {timerSeconds > 0 && !isTimerRunning && (
                          <button 
                            onClick={handleResetTimer}
                            className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-2xl transition-all"
                            title="Reset Timer"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {timerSeconds > 0 && !isTimerRunning && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            onClick={() => setIsLogModalOpen(true)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Finish & Log Session
                          </motion.button>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                {/* Streak Tracking */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 shadow-lg shadow-orange-100 text-white flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                   <div className="flex justify-between items-start relative z-10">
                     <h3 className="font-bold text-orange-100 text-sm tracking-wide">Daily Streak</h3>
                     <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                        <Flame className="h-5 w-5 text-white" />
                     </div>
                   </div>
                   <div className="relative z-10 mt-4">
                     <div className="text-5xl font-bold tracking-tight">14 Days</div>
                     <p className="text-sm text-orange-100/80 mt-2 font-medium">Keep it up! Personal best: 21</p>
                   </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-3 justify-center">
                   <button onClick={() => setIsLogModalOpen(true)} className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-indigo-100 active:scale-[0.98]">
                     <Plus className="h-4 w-4" /> Log a Session
                   </button>
                   <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200 active:scale-[0.98]">
                     <Repeat className="h-4 w-4" /> Recurring Templates
                   </button>
                   <button className="w-full bg-slate-50 text-slate-700 hover:bg-slate-100 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-slate-200 active:scale-[0.98]">
                     <Download className="h-4 w-4" /> Export to CSV
                   </button>
                </div>
             </div>

             {/* Sessions List */}
             <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
                   <div className="relative w-full sm:w-80">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                     <input 
                       type="text" placeholder="Search sessions by keyword..." 
                       value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                     />
                   </div>
                   <div className="flex gap-2 w-full sm:w-auto">
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <Calendar className="h-4 w-4" /> Date
                     </button>
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                        <TagIcon className="h-4 w-4" /> Tag
                     </button>
                   </div>
                </div>

                <div className="divide-y divide-slate-50">
                   {filteredSessions.map(session => (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={session.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row gap-6 items-start sm:items-center group">
                        <div className="flex items-center gap-5 shrink-0">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:bg-indigo-100 transition-colors">
                            <Clock className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-2xl font-extrabold text-slate-900 tabular-nums leading-none tracking-tight">
                              {Math.floor(session.duration/60)}h {session.duration%60}m
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{session.date}</p>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{session.title}</h4>
                           <p className="text-sm text-slate-500 mb-4 line-clamp-1 leading-relaxed">{session.notes}</p>
                           <div className="flex flex-wrap items-center gap-2">
                              {session.tags.map(tag => (
                                <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200/50">#{tag}</span>
                              ))}
                              {session.goalId && (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5">
                                  <Target className="h-3 w-3" /> {session.goalId}
                                </span>
                              )}
                              {session.skillId && (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                                  <Code2 className="h-3 w-3" /> {session.skillId}
                                </span>
                              )}
                           </div>
                        </div>

                        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                           <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit a session">
                             <Edit2 className="h-4.5 w-4.5" />
                           </button>
                           <button onClick={() => deleteSession(session.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete a session">
                             <Trash2 className="h-4.5 w-4.5" />
                           </button>
                        </div>
                     </motion.div>
                   ))}
                   {filteredSessions.length === 0 && (
                     <div className="p-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                           <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No sessions found matching your criteria.</p>
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
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
             <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between p-7 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3"><div className="p-2 bg-indigo-600 rounded-xl"><Plus className="h-5 w-5 text-white" /></div> Log a Session</h2>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="grid grid-cols-2 gap-5">
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Session Title</label>
                       <input type="text" placeholder="What did you work on?" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Duration (min)</label>
                       <input type="number" defaultValue={Math.floor(timerSeconds / 60)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                       <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes & Highlights</label>
                       <textarea rows={3} placeholder="Bugs encountered, logic solved, or future tasks..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none" />
                     </div>
                     <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                       <input type="text" placeholder="e.g. Frontend, React, Bugfix" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                     </div>
                     
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Link Goal</label>
                       <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 appearance-none">
                         <option>None</option>
                         <option>Master React Native</option>
                         <option>Migrate DB</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Link Skill</label>
                       <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-600 appearance-none">
                         <option>None</option>
                         <option>React</option>
                         <option>TypeScript</option>
                         <option>PostgreSQL</option>
                       </select>
                     </div>
                   </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                  <button onClick={() => setIsLogModalOpen(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
                  <button onClick={() => { setIsLogModalOpen(false); handleResetTimer(); }} className="px-8 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95">
                    <CheckCircle2 className="h-5 w-5" /> Save Session
                  </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};