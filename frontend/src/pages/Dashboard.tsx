import { motion } from "motion/react";
import { 
  Terminal, Flame, Timer, Lightbulb, 
  CheckCircle2, Activity, Plus
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

// Mock Data
const sessionsData = [
  { name: 'Mon', sessions: 3 }, { name: 'Tue', sessions: 5 }, { name: 'Wed', sessions: 2 },
  { name: 'Thu', sessions: 6 }, { name: 'Fri', sessions: 4 }, { name: 'Sat', sessions: 1 }, { name: 'Sun', sessions: 0 },
];

const goalStatusData = [
  { name: 'Completed', value: 12, color: '#10b981' },
  { name: 'In Progress', value: 5, color: '#6366f1' },
  { name: 'Blocked', value: 2, color: '#f43f5e' },
];

const skillTiers = [
  { name: 'React', level: 85, tier: 'Expert' },
  { name: 'TypeScript', level: 70, tier: 'Advanced' },
  { name: 'Node.js', level: 60, tier: 'Intermediate' },
  { name: 'Python', level: 40, tier: 'Novice' },
];

const heatmapData = Array.from({ length: 84 }, () => Math.floor(Math.random() * 5));

const getHeatmapColor = (value: number) => {
  if (value === 0) return 'bg-slate-100';
  if (value === 1) return 'bg-indigo-200';
  if (value === 2) return 'bg-indigo-300';
  if (value === 3) return 'bg-indigo-400';
  return 'bg-indigo-500';
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring" as const, // <--- Add 'as const' here
      stiffness: 300, 
      damping: 24 
    } 
  }
};

export const Dashboard = () => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Daily Tip */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden group">
         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500"></div>
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm shadow-sm">
              <Lightbulb className="h-6 w-6 text-indigo-50" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Daily Tip</h3>
              <p className="text-indigo-100 text-sm">"The best time to plant a tree was 20 years ago. The second best time is when your code finally compiles."</p>
            </div>
         </div>
      </motion.div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Streak Counter", value: "14 Days", sub: "Personal best: 21", icon: <Flame className="h-6 w-6 text-orange-500" />, color: "bg-orange-50 border-orange-100" },
          { label: "Total Hours", value: "342h", sub: "+12h this week", icon: <Timer className="h-6 w-6 text-indigo-600" />, color: "bg-indigo-50 border-indigo-100" },
          { label: "Sessions", value: "21", sub: "Goal: 25", icon: <Activity className="h-6 w-6 text-emerald-600" />, color: "bg-emerald-50 border-emerald-100" },
          { label: "Goals Done", value: "8", sub: "3 remaining", icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />, color: "bg-blue-50 border-blue-100" },
        ].map((stat, i) => (
          <motion.div variants={itemVariants} whileHover={{ y: -4 }} key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className={`p-2.5 rounded-lg w-fit mb-4 ${stat.color}`}>{stat.icon}</div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">{stat.label}</span>
              <span className="text-slate-400">{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="font-semibold text-slate-800 mb-6">Sessions per week</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionsData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="sessions" radius={[4, 4, 0, 0]} barSize={32}>
                   {sessionsData.map((_, index) => (
                      <Cell key={index} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Goal Status Donut */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
           <h3 className="font-semibold text-slate-800 mb-2">Goal Status</h3>
           <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={goalStatusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {goalStatusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <span className="text-3xl font-bold text-slate-800">19</span>
                 <span className="text-xs text-slate-500 uppercase font-medium">Total</span>
              </div>
           </div>
        </motion.div>
      </div>

      {/* Heatmap & Skill Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h3 className="font-semibold text-slate-800 mb-6">Activity Heatmap</h3>
            <div className="grid grid-rows-7 grid-flow-col gap-1.5 overflow-x-auto pb-2">
              {heatmapData.map((val, i) => (
                <motion.div key={i} whileHover={{ scale: 1.2 }} className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(val)} border border-black/5`} />
              ))}
            </div>
         </motion.div>

         <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-6">Skill Tier Distribution</h3>
            <div className="space-y-5">
               {skillTiers.map((skill, i) => (
                <div key={i}>
                   <div className="flex justify-between text-sm mb-1.5 font-medium">
                      <span className="text-slate-700">{skill.name}</span>
                      <span className="text-slate-500 text-xs">{skill.tier}</span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${skill.level}%` }} transition={{ duration: 1 }} className="bg-indigo-500 h-2 rounded-full" />
                   </div>
                </div>
               ))}
            </div>
         </motion.div>
      </div>

      {/* Recent Sessions & Pinned Goals (FIXED) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Sessions</h3>
            <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 transition-colors">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { title: "Refactoring Auth Module", time: "2h 15m", date: "Today, 10:30 AM", tag: "Backend" },
              { title: "Landing Page Redesign", time: "1h 45m", date: "Yesterday, 2:00 PM", tag: "Frontend" },
              { title: "API Documentation", time: "45m", date: "Oct 12, 4:15 PM", tag: "Docs" },
            ].map((session, i) => (
              <motion.div key={i} whileHover={{ x: 6, backgroundColor: "rgb(248 250 252)" }} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{session.title}</p>
                    <p className="text-xs text-slate-500">{session.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-700 text-sm">{session.time}</p>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{session.tag}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Pinned Goals</h3>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"><Plus className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            {[
              { title: "Master React Native", progress: 65, daysLeft: 12, color: "bg-blue-500" },
              { title: "Complete System Design Course", progress: 30, daysLeft: 24, color: "bg-emerald-500" },
              { title: "Launch Side Project", progress: 85, daysLeft: 5, color: "bg-purple-500" },
            ].map((goal, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{goal.title}</h4>
                  <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm">{goal.daysLeft}d left</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${goal.progress}%` }} transition={{ duration: 1.2 }} className={`h-full rounded-full ${goal.color}`} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};