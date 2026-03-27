import { motion, type Variants } from "motion/react"; // 1. Use type-only import
import type { ReactNode } from "react"; // 1. Use type-only import

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: ReactNode;
  color: string;
  variants: Variants; // 2. Changed from any to Variants
}

export const StatCard = ({ label, value, sub, icon, color, variants }: StatCardProps) => (
  <motion.div 
    variants={variants}
    whileHover={{ 
      y: -4, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" // 3. Fixed 'shadow' to 'boxShadow'
    }}
    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="flex justify-between items-end">
      <span className="text-slate-500 text-sm font-medium">{label}</span>
      <span className="text-slate-400 text-xs">{sub}</span>
    </div>
  </motion.div>
);