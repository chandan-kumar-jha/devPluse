import { motion, type Variants } from "motion/react";
import { Plus } from "lucide-react";

// 1. Define the Goal interface
interface Goal {
  title: string;
  progress: number;
  daysLeft: number;
  color: string;
}

// 2. Define Props with strict types
interface PinnedGoalsProps {
  goals: Goal[];
  variants: Variants;
}

export const PinnedGoals = ({ goals, variants }: PinnedGoalsProps) => (
  <motion.div 
    variants={variants} 
    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-800">Pinned Goals</h3>
      <button 
        type="button"
        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
        aria-label="Add new goal"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>

    <div className="space-y-4">
      {goals.map((goal) => (
        <div 
          key={goal.title} 
          className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
              {goal.title}
            </h4>
            <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">
              {goal.daysLeft}d left
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${goal.progress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className={`h-full rounded-full ${goal.color}`} 
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{goal.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);