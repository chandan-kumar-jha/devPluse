import { motion } from "motion/react";
import { memo } from "react";

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress = memo(
  ({ progress, size = 44, strokeWidth = 4 }: Props) => {
    const safeProgress = Math.min(100, Math.max(0, progress));
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safeProgress / 100) * circumference;

    return (
      <div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={
              safeProgress === 100 ? "text-emerald-500" : "text-indigo-600"
            }
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
          {Math.round(safeProgress)}%
        </div>
      </div>
    );
  }
);