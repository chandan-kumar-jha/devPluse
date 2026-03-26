import { motion, AnimatePresence } from "motion/react";
import { 
   Plus, Search, Calendar as CalendarIcon, 
  MoreVertical, CheckCircle2, Trash2, Edit2, 
  MapPin, ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";

// --- TYPES & MOCK DATA (Same as your original) ---
type Milestone = { id: string; title: string; isCompleted: boolean; };
type Goal = {
  id: string; title: string; description: string; deadline: string;
  status: 'Active' | 'Done'; category: string; milestones: Milestone[];
};

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Master React Native",
    description: "Build 3 complete mobile applications and publish one to the App Store.",
    deadline: "2026-06-30",
    status: "Active",
    category: "Learning",
    milestones: [
      { id: "m1", title: "Complete fundamentals course", isCompleted: true },
      { id: "m2", title: "Build weather app", isCompleted: true },
      { id: "m3", title: "Build task manager app", isCompleted: false },
    ]
  },
  // ... other initial goals
];

const CATEGORIES = ["Learning", "Infrastructure", "Career", "Maintenance", "Product"];

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'Learning': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'Infrastructure': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Career': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const CircularProgress = ({ progress, size = 44, strokeWidth = 4 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-100" />
        <motion.circle 
          cx={size / 2} cy={size / 2} r={radius} 
          stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
          strokeDasharray={circumference} 
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={progress === 100 ? "text-emerald-500" : "text-indigo-600"} 
          strokeLinecap="round" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(initialGoals[0].id);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  const selectedGoal = goals.find(g => g.id === selectedGoalId) || null;

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => 
      goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      goal.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a) => (a.status === 'Active' ? -1 : 1));
  }, [goals, searchQuery]);

  // Actions (Keep your existing toggleGoalStatus, deleteGoal, createGoal, etc.)
  const toggleGoalStatus = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, status: g.status === 'Done' ? 'Active' : 'Done' } : g));
  };

  const deleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    if (selectedGoalId === id) setSelectedGoalId(updated[0]?.id || null);
  };

  const createGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: "New Objective",
      description: "Define what success looks like.",
      deadline: format(new Date(Date.now() + 30*24*60*60*1000), 'yyyy-MM-dd'),
      status: "Active",
      category: "Learning",
      milestones: []
    };
    setGoals([newGoal, ...goals]);
    setSelectedGoalId(newGoal.id);
    setIsEditingGoal(true);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m => m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m);
        const allDone = updatedMilestones.length > 0 && updatedMilestones.every(m => m.isCompleted);
        return { ...g, milestones: updatedMilestones, status: allDone ? 'Done' : 'Active' };
      }
      return g;
    }));
  };

  const addMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !newMilestoneTitle.trim()) return;
    setGoals(goals.map(g => g.id === selectedGoal.id ? {
      ...g,
      milestones: [...g.milestones, { id: Date.now().toString(), title: newMilestoneTitle.trim(), isCompleted: false }],
      status: 'Active'
    } : g));
    setNewMilestoneTitle("");
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) } : g));
  };

  return (
    /* Removed the full sidebar/header wrapper. This div now sits inside the Layout's Outlet. */
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* LEFT COLUMN: Goals List */}
      <div className="w-full lg:w-1/3 max-w-sm border-r border-slate-200 bg-slate-50/30 flex flex-col flex-shrink-0 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white">
            <button onClick={createGoal} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mb-4">
              <Plus className="h-4 w-4" /> New Goal
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" placeholder="Search goals..." 
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {filteredGoals.map(goal => {
              const compCount = goal.milestones.filter(m => m.isCompleted).length;
              const total = goal.milestones.length;
              const progress = total === 0 ? 0 : (compCount / total) * 100;
              const isSelected = selectedGoalId === goal.id;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={goal.id} 
                  onClick={() => { setSelectedGoalId(goal.id); setIsEditingGoal(false); }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-white border-indigo-300 shadow-md ring-1 ring-indigo-500/20' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200 hover:shadow-md'} ${goal.status === 'Done' ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <CircularProgress progress={progress} />
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>{goal.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 mb-2">{total > 0 ? `${compCount} of ${total} milestones` : 'No milestones'}</p>
                      <div className="flex items-center gap-2">
                         <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(goal.category)}`}>
                           {goal.category}
                         </span>
                         {goal.status === 'Done' && (
                           <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                             <CheckCircle2 className="h-3 w-3" /> Done
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT COLUMN: Milestone Roadmap View */}
      <div className="flex-1 bg-white relative flex flex-col overflow-hidden">
        {selectedGoal ? (
          <>
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
               <div className="max-w-3xl mx-auto">
                 {isEditingGoal ? (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                     <input 
                       type="text" value={selectedGoal.title} 
                       onChange={(e) => setGoals(goals.map(g => g.id === selectedGoal.id ? { ...g, title: e.target.value } : g))}
                       className="text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                     />
                     <textarea 
                       value={selectedGoal.description}
                       onChange={(e) => setGoals(goals.map(g => g.id === selectedGoal.id ? { ...g, description: e.target.value } : g))}
                       className="w-full text-slate-600 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none" rows={2}
                     />
                     <div className="flex items-center gap-4">
                       <input type="date" value={selectedGoal.deadline} onChange={(e) => setGoals(goals.map(g => g.id === selectedGoal.id ? { ...g, deadline: e.target.value } : g))} className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"/>
                       <select value={selectedGoal.category} onChange={(e) => setGoals(goals.map(g => g.id === selectedGoal.id ? { ...g, category: e.target.value } : g))} className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                       <button onClick={() => setIsEditingGoal(false)} className="ml-auto bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Done Editing</button>
                     </div>
                   </motion.div>
                 ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-start gap-6">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <h2 className="text-2xl font-bold text-slate-800">{selectedGoal.title}</h2>
                         <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(selectedGoal.category)}`}>
                           {selectedGoal.category}
                         </span>
                       </div>
                       <p className="text-slate-600 mb-4 max-w-2xl">{selectedGoal.description}</p>
                       <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                         <span className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
                           <CalendarIcon className="h-4 w-4" /> 
                           Deadline: <span className="text-slate-800">{format(new Date(selectedGoal.deadline), 'MMM d, yyyy')}</span>
                         </span>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button onClick={() => setIsEditingGoal(true)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent bg-white shadow-sm">
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <Popover.Root>
                          <Popover.Trigger asChild>
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-transparent bg-white shadow-sm">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content className="w-48 bg-white rounded-lg shadow-xl border border-slate-200 p-1 z-50 text-sm" align="end">
                              <button onClick={() => toggleGoalStatus(selectedGoal.id)} className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-md transition-colors">
                                <CheckCircle2 className="h-4 w-4" /> Mark as {selectedGoal.status === 'Done' ? 'Active' : 'Done'}
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button onClick={() => deleteGoal(selectedGoal.id)} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                                <Trash2 className="h-4 w-4" /> Delete Goal
                              </button>
                            </Popover.Content>
                          </Popover.Portal>
                       </Popover.Root>
                     </div>
                   </motion.div>
                 )}
               </div>
            </div>

            {/* Milestone Journey */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 relative bg-slate-50/30">
              <div className="max-w-2xl mx-auto relative">
                <div className="absolute left-[23px] lg:left-[39px] top-6 bottom-16 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent"></div>
                <div className="space-y-6 lg:space-y-8 relative">
                  <AnimatePresence>
                    {selectedGoal.milestones.map((milestone, index) => (
                      <motion.div 
                        key={milestone.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 lg:gap-6 group"
                      >
                        <button 
                          onClick={() => toggleMilestone(selectedGoal.id, milestone.id)}
                          className={`relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-white border-4 transition-all duration-300 shadow-sm ${milestone.isCompleted ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300 hover:border-indigo-400'}`}
                        >
                          {milestone.isCompleted ? <CheckCircle2 className="h-6 w-6 lg:h-10 lg:w-10" /> : <span className="text-sm lg:text-xl font-bold">{index + 1}</span>}
                        </button>
                        <div className={`flex-1 bg-white rounded-xl border p-4 shadow-sm transition-all ${milestone.isCompleted ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
                           <div className="flex justify-between items-start gap-4">
                             <div className="flex-1">
                               <h4 className={`text-base lg:text-lg font-medium ${milestone.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{milestone.title}</h4>
                             </div>
                             <button onClick={() => deleteMilestone(selectedGoal.id, milestone.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                               <Trash2 className="h-4 w-4" />
                             </button>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Inline Add Milestone */}
                  <motion.div layout className="flex items-center gap-4 lg:gap-6 pt-4">
                     <div className="relative z-10 flex-shrink-0 w-12 h-12 lg:w-20 lg:h-20 rounded-full flex items-center justify-center bg-slate-50 border-4 border-dashed border-slate-200 text-slate-400">
                        <Plus className="h-6 w-6" />
                     </div>
                     <form onSubmit={addMilestone} className="flex-1 relative flex items-center">
                       <input 
                         type="text" value={newMilestoneTitle} onChange={(e) => setNewMilestoneTitle(e.target.value)}
                         placeholder="Add next milestone..."
                         className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-12 py-3 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                       />
                       <button type="submit" disabled={!newMilestoneTitle.trim()} className="absolute right-2 p-2 bg-indigo-50 text-indigo-600 rounded-lg disabled:opacity-50">
                         <ChevronRight className="h-5 w-5" />
                       </button>
                     </form>
                  </motion.div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 bg-slate-50/50">
            <div className="max-w-md">
              <MapPin className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Goal to View Roadmap</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};