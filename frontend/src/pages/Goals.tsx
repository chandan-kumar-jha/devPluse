import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, Target, Plus, Search, CheckCircle2, 
  Trash2, Edit2, ChevronRight, X, Calendar 
} from "lucide-react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useGoalStore } from "../store/useGoalStore";

const CATEGORIES = ["Learning", "Infrastructure", "Career", "Maintenance", "Product"];

export const Goals = () => {
  const { 
    goals, fetchGoals, selectedGoal, selectGoal, 
    createGoal, deleteGoal, addMilestone, toggleMilestone, 
    deleteMilestone, updateGoal 
  } = useGoalStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", deadline: "" });

  const activeGoal = selectedGoal();

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // Sync edit form with selected goal
  useEffect(() => {
    if (activeGoal) {
      setEditForm({
        title: activeGoal.title || "",
        description: activeGoal.description || "",
        category: activeGoal.category || "Learning",
        deadline: activeGoal.deadline ? activeGoal.deadline.split('T')[0] : ""
      });

      // If it's a freshly created goal (temp or just named "New Objective"), open editor
      if (activeGoal.title === "New Objective" || activeGoal._id.startsWith('temp-')) {
        setIsEditingGoal(true);
      }
    }
  }, [activeGoal?._id]); 

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => goal.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [goals, searchQuery]);

  const handleCreateNew = async () => {
    setIsEditingGoal(true);
    await createGoal({ title: "New Objective", category: "Learning" });
  };

 const handleSaveEdit = async () => {
  if (!activeGoal) return;

  // Create a copy of the form to modify safely
  const payload = { ...editForm };

  // If deadline is an empty string, set it to null so the DB accepts it
  if (!payload.deadline || payload.deadline.trim() === "") {
    delete payload.deadline; 
    // OR: payload.deadline = null; (depending on your backend validation)
  }

  await updateGoal(activeGoal._id, payload);
  setIsEditingGoal(false);
};

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden">
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 px-6 flex items-center justify-between z-30 shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Terminal className="text-white h-5 w-5" />
            </div>
            <span className="text-slate-900 font-bold text-xl tracking-tight">DevTrack</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Portal</p>
            <p className="text-xs font-bold text-slate-700">Chandan Kumar</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-bold">CK</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-[320px] border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Objectives</h2>
              <button 
                onClick={handleCreateNew} 
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" placeholder="Filter goals..." 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-10 space-y-1">
            {filteredGoals.map(goal => (
              <button 
                key={goal._id} 
                onClick={() => { selectGoal(goal._id); setIsEditingGoal(false); }}
                className={`w-full text-left p-4 rounded-2xl transition-all border ${activeGoal?._id === goal._id ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
              >
                <h3 className={`text-sm font-bold truncate ${activeGoal?._id === goal._id ? 'text-indigo-700' : 'text-slate-700'}`}>{goal.title}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{goal.category}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-50/30 overflow-y-auto p-6 lg:p-10">
          {activeGoal ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                
                {isEditingGoal ? (
                  <div className="space-y-6">
                    {/* UI FIX: This heading now reflects editForm.title instantly */}
                    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight min-h-[1em]">
                      {editForm.title || "New Objective"}
                    </h2>
                    
                    <div className="space-y-4 border-t border-slate-100 pt-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Goal Name</label>
                        <input 
                          autoFocus 
                          className="w-full text-xl font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-indigo-500/20" 
                          value={editForm.title} 
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                        <textarea className="w-full p-4 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none" rows={3} value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => setIsEditingGoal(false)} className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                          <button 
                            onClick={handleSaveEdit} 
                            disabled={activeGoal._id.startsWith('temp-')}
                            className="px-10 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 active:scale-95 hover:bg-indigo-700 disabled:opacity-50"
                          >
                            {activeGoal._id.startsWith('temp-') ? 'Saving...' : 'Update'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-100">{activeGoal.category}</span>
                        {activeGoal.deadline && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Calendar size={12}/> {format(new Date(activeGoal.deadline), 'MMM d, yyyy')}</span>}
                      </div>
                      <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">{activeGoal.title}</h2>
                      <p className="mt-4 text-slate-500 text-lg leading-relaxed">{activeGoal.description || "No description provided."}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setIsEditingGoal(true)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 border border-slate-200 rounded-2xl shadow-sm transition-all hover:border-indigo-100"><Edit2 size={20} /></button>
                      <button onClick={() => deleteGoal(activeGoal._id)} className="p-3 bg-white text-slate-400 hover:text-red-600 border border-slate-200 rounded-2xl shadow-sm transition-all hover:border-red-100"><Trash2 size={20} /></button>
                    </div>
                  </div>
                )}
              </div>

              {/* Milestones Area */}
              <div className="relative pl-10 border-l-2 border-slate-200 space-y-8 ml-6">
                <AnimatePresence mode="popLayout">
                  {activeGoal.milestones?.map((m, idx) => (
                    <motion.div key={m._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative group">
                      <button onClick={() => toggleMilestone(activeGoal._id, m._id)} className={`absolute -left-[54px] top-1 w-10 h-10 rounded-full bg-white border-4 flex items-center justify-center transition-all ${m.completed ? 'border-emerald-500 text-emerald-500 scale-105 shadow-lg shadow-emerald-50' : 'border-slate-300 text-slate-400 hover:border-indigo-400'}`}>
                        {m.completed ? <CheckCircle2 size={20} /> : <span className="text-[11px] font-bold">{idx + 1}</span>}
                      </button>
                      <div className={`p-5 rounded-2xl border transition-all duration-300 ${m.completed ? 'bg-white opacity-60 border-emerald-100' : 'bg-[#0F172A] border-[#1E293B] shadow-xl text-slate-100 font-medium'}`}>
                        <div className="flex justify-between items-center gap-3">
                          <span className={m.completed ? 'line-through text-slate-400' : ''}>{m.title}</span>
                          <button onClick={() => deleteMilestone(activeGoal._id, m._id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <form className="flex gap-3 pt-4 group" onSubmit={(e) => { e.preventDefault(); if(newMilestoneTitle.trim()){ addMilestone(activeGoal._id, newMilestoneTitle); setNewMilestoneTitle(""); }}}>
                  <div className="absolute -left-[54px] w-10 h-10 rounded-full border-4 border-dashed border-slate-200 bg-white flex items-center justify-center text-slate-300 group-focus-within:border-indigo-300 group-focus-within:text-indigo-400 transition-colors">+</div>
                  <input className="flex-1 bg-white border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:ring-4 ring-indigo-500/10 transition-all text-sm shadow-sm" placeholder="Define the next step..." value={newMilestoneTitle} onChange={(e) => setNewMilestoneTitle(e.target.value)} />
                  <button type="submit" disabled={!newMilestoneTitle.trim() || activeGoal._id.startsWith('temp-')} className="bg-indigo-600 text-white px-5 rounded-2xl shadow-lg active:scale-95 disabled:opacity-40"><ChevronRight size={24} /></button>
                </form>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Target size={60} className="mb-4 opacity-10" />
              <p className="text-lg font-bold text-slate-600">Focus on your mission</p>
              <p className="text-sm">Select an objective to map out your journey</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};