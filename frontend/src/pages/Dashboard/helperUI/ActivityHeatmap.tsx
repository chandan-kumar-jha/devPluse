import { motion } from "motion/react";

interface ActivityHeatmapProps {
  data: number[];
  variants: {
    hidden: { opacity: number; y: number };
    show: { opacity: number; y: number };
  };
}

export const ActivityHeatmap = ({ data, variants }: ActivityHeatmapProps) => {
  const getHeatmapColor = (value: number): string => {
    if (value === 0) return 'bg-slate-100';
    if (value === 1) return 'bg-indigo-200';
    if (value === 2) return 'bg-indigo-300';
    if (value === 3) return 'bg-indigo-400';
    return 'bg-indigo-500';
  };

  return (
    <motion.div variants={variants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-800">Activity Heatmap</h3>
        <span className="text-xs text-slate-500 font-medium">Last 3 Months</span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-max">
          {data.map((val, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(val)} cursor-pointer border border-black/5`}
              title={`${val} sessions`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((v) => (
            <div key={v} className={`w-3 h-3 rounded-sm ${getHeatmapColor(v)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </motion.div>
  );
};