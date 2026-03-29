import { motion } from "motion/react";
import { Square } from "lucide-react";

type SessionTimerProps = {
  timerSeconds: number;
  onStop: () => void;
};

const formatTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export const SessionTimer = ({ timerSeconds, onStop }: SessionTimerProps) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-indigo-600 text-white rounded-xl p-4 shadow-lg flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse" />
      <div>
        <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
          Active Session
        </p>
        <p className="text-2xl font-mono font-bold tracking-tight">
          {formatTime(timerSeconds)}
        </p>
      </div>
    </div>
    <button
      onClick={onStop}
      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
    >
      <Square className="h-4 w-4" /> Stop & Log
    </button>
  </motion.div>
);
