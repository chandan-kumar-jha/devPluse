import { motion,type Variants } from "motion/react";
import { Terminal } from "lucide-react";

// 1. Define the Session shape
interface Session {
  title: string;
  time: string;
  date: string;
  tag: string;
}

// 2. Strict Props Interface
interface RecentSessionsProps {
  sessions: Session[];
  variants: Variants;
}

export const RecentSessions = ({ sessions, variants }: RecentSessionsProps) => (
  <motion.div 
    variants={variants} 
    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-800">Recent Sessions</h3>
      <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">
        View All
      </button>
    </div>
    
    <div className="space-y-3">
      {sessions.map((session, i) => (
        <motion.div 
          key={`${session.title}-${i}`} 
          whileHover={{ x: 4, backgroundColor: "rgb(248 250 252)" }}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-800 text-sm truncate">{session.title}</p>
              <p className="text-xs text-slate-500">{session.date}</p>
            </div>
          </div>
          
          <div className="text-right shrink-0">
            <p className="font-semibold text-slate-700 text-sm">{session.time}</p>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {session.tag}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);