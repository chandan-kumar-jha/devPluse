import { motion, type Variants } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, CartesianGrid 
} from "recharts";

// 1. Interfaces updated for props
interface SessionData {
  name: string;
  sessions: number;
}

interface GoalStatus {
  name: string;
  value: number;
  color: string;
}

// 2. Updated Props Definition to accept data from Dashboard
interface ChartProps {
  variants: Variants;
  chartData?: SessionData[]; // Optional so it doesn't break if data is missing
}

interface GoalChartProps {
  variants: Variants;
  data?: GoalStatus[];
}

// Default/Fallback data agar backend se na aaye
const defaultSessions: SessionData[] = [
  { name: 'Mon', sessions: 0 }, { name: 'Tue', sessions: 0 },
  { name: 'Wed', sessions: 0 }, { name: 'Thu', sessions: 0 },
  { name: 'Fri', sessions: 0 }, { name: 'Sat', sessions: 0 },
  { name: 'Sun', sessions: 0 },
];

export const SessionsChart = ({ variants, chartData = defaultSessions }: ChartProps) => (
  <motion.div 
    variants={variants} 
    className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-6">
       <h3 className="font-semibold text-slate-800">Sessions per week</h3>
       <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View Report</button>
    </div>
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
          />
          <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32}>
             {chartData.map((entry: SessionData, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index % 2 === 0 ? '#818cf8' : '#4f46e5'} 
                />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </motion.div>
);

export const GoalStatusChart = ({ variants, data = [] }: GoalChartProps) => {
  // Total calculate karne ke liye logic
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div 
      variants={variants} 
      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
       <h3 className="font-semibold text-slate-800 mb-2">Goal Status</h3>
       <div className="flex-1 flex items-center justify-center relative min-h-50">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={data} 
                innerRadius={60} 
                outerRadius={80} 
                paddingAngle={5} 
                dataKey="value" 
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <span className="text-3xl font-bold text-slate-800">{total}</span>
             <span className="text-xs text-slate-500 font-medium uppercase">Total</span>
          </div>
       </div>
       <div className="flex justify-center flex-wrap gap-4 mt-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
              {item.name}
            </div>
          ))}
       </div>
    </motion.div>
  );
};