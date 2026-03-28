import { motion, type Variants } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { 
  Flame, Timer, Activity, CheckCircle2,  
  Calendar as CalendarIcon, Loader2 
} from "lucide-react";

import { fetchDashboardStats } from "../../api/dashboard.api";

// Components
import { StatCard } from "./helperUI/StatCard";
import { SessionsChart, GoalStatusChart } from "./helperUI/Charts";
import { ActivityHeatmap } from "./helperUI/ActivityHeatmap";
import { SkillDistribution } from "./helperUI/SkillDistribution";
import { RecentSessions } from "./helperUI/RecentSessions";
import { PinnedGoals } from "./helperUI/PinnedGoals";

const containerVariants = {
  hidden: { opacity: 9 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
} satisfies Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
} satisfies Variants;

export const Dashboard = () => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  // Backend response structure: { success: true, data: { stats: {}, charts: {}, widgets: {} } }
  const dashboard = response?.data;

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center w-full">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Overview</h2>
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
            <CalendarIcon className="h-4 w-4" />
            {dashboard?.dateRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Current Streak" 
            value={`${dashboard?.streak?.current ?? 0} Days`} 
            sub={`Best: ${dashboard?.streak?.longest ?? 0}`} 
            icon={<Flame className="h-6 w-6 text-orange-500" />} 
            color="bg-orange-50 border-orange-100" variants={itemVariants} 
          />
          <StatCard 
            label="Total Hours" 
            value={`${dashboard?.stats?.totalHours ?? 0}h`} 
            sub="Focus Time" 
            icon={<Timer className="h-6 w-6 text-indigo-600" />} 
            color="bg-indigo-50 border-indigo-100" variants={itemVariants} 
          />
          <StatCard 
            label="Sessions" 
            value={`${dashboard?.stats?.totalSessions ?? 0}`} 
            sub="Total Completed" 
            icon={<Activity className="h-6 w-6 text-emerald-600" />} 
            color="bg-emerald-50 border-emerald-100" variants={itemVariants} 
          />
          <StatCard 
            label="Active Goals" 
            value={`${dashboard?.stats?.activeGoals ?? 0}`} 
            sub={`Done: ${dashboard?.stats?.completedGoals ?? 0}`} 
            icon={<CheckCircle2 className="h-6 w-6 text-blue-600" />} 
            color="bg-blue-50 border-blue-100" variants={itemVariants} 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SessionsChart 
            variants={itemVariants} 
            chartData={dashboard?.charts?.sessionsPerWeek ?? []} 
          />
          <GoalStatusChart 
            variants={itemVariants} 
            data={[
                { name: 'Active', value: dashboard?.charts?.goalStatus?.active ?? 0, color: '#6366f1' },
                { name: 'Done', value: dashboard?.charts?.goalStatus?.done ?? 0, color: '#10b981' },
                { name: 'Archived', value: dashboard?.charts?.goalStatus?.archived ?? 0, color: '#94a3b8' },
            ]}
          />
        </div>

        {/* Heatmap & Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <ActivityHeatmap data={dashboard?.heatmap ?? []} variants={itemVariants} />
           <SkillDistribution 
             skills={Object.entries(dashboard?.charts?.skillTiers ?? {}).map(([tierName, count]) => ({
    name: tierName.charAt(0).toUpperCase() + tierName.slice(1), // e.g., "Beginner"
    tier: tierName, // "beginner", "intermediate", etc.
    level: Number(count) > 0 ? 100 : 0, // Placeholder level jab tak backend real level na de
  }))} 
  variants={itemVariants}
           />
        </div>

        {/* Recent Activity & Pinned Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <RecentSessions sessions={dashboard?.widgets?.recentSessions ?? []} variants={itemVariants} />
           <PinnedGoals goals={dashboard?.widgets?.pinnedGoals ?? []} variants={itemVariants} />
        </div>
      </motion.div>
    </div>
  );
};