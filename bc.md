
// Mock Data
const sessionsData = [
  { name: 'Mon', sessions: 3 },
  { name: 'Tue', sessions: 5 },
  { name: 'Wed', sessions: 2 },
  { name: 'Thu', sessions: 6 },
  { name: 'Fri', sessions: 4 },
  { name: 'Sat', sessions: 1 },
  { name: 'Sun', sessions: 0 },
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
  }
};