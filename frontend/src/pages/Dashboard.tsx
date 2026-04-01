// pages/Dashboard.tsx
import { useEffect } from "react";
import { motion } from "motion/react";
import {
  Terminal, LayoutDashboard, Target, Code2,
  Bell, Settings, LogOut, Clock, Plus,
  ChevronDown, Flame, Timer, Lightbulb,
  Calendar as CalendarIcon, CheckCircle2,
  ChevronRight, Activity, AlertCircle, X,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { useDashboardStore } from "../store/useDashboardstore";

type DateRange = "7d" | "30d" | "90d";


// ─── Helpers ──────────────────────────────────────────────────────────────────

const getHeatmapColor = (count: number) => {
  if (count === 0) return "bg-slate-100";
  if (count === 1) return "bg-indigo-200";
  if (count === 2) return "bg-indigo-300";
  if (count === 3) return "bg-indigo-400";
  return "bg-indigo-500";
};

/** Fill a 84-cell (12-week × 7) grid from sparse heatmap data */
const buildHeatmapGrid = (
  entries: { date: string; count: number }[]
): number[] => {
  const map = new Map(entries.map((e) => [e.date.slice(0, 10), e.count]));
  const grid: number[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    grid.push(map.get(key) ?? 0);
  }
  return grid;
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const TIER_COLORS: Record<string, string> = {
  beginner: "bg-slate-400",
  intermediate: "bg-indigo-400",
  advanced: "bg-indigo-500",
  expert: "bg-indigo-700",
};

const GOAL_COLORS: Record<string, string> = {
  "bg-blue-500": "#3b82f6",
  "bg-emerald-500": "#10b981",
  "bg-purple-500": "#a855f7",
  "bg-orange-500": "#f97316",
};

const DEFAULT_GOAL_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data, dateRange, loading, error, loadDashboard, setDateRange, clearError } =
    useDashboardStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleLogout = () => navigate("/");

  const dateRangeOptions: { label: string; value: DateRange }[] = [
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
    { label: "Last 90 Days", value: "90d" },
  ];

  const heatmapGrid = data ? buildHeatmapGrid(data.heatmap) : Array(84).fill(0);

  // Stat cards derived from API
  const statCards = data
    ? [
        {
          label: "Current Streak",
          value: `${data.streak.current} Days`,
          sub: `Longest: ${data.streak.longest}d`,
          icon: <Flame className="h-6 w-6 text-orange-500" />,
          color: "bg-orange-50 border-orange-100",
        },
        {
          label: "Total Hours Coded",
          value: `${data.stats.totalHours.toFixed(1)}h`,
          sub: `${data.stats.totalSessions} sessions`,
          icon: <Timer className="h-6 w-6 text-indigo-600" />,
          color: "bg-indigo-50 border-indigo-100",
        },
        {
          label: "Active Goals",
          value: String(data.stats.activeGoals),
          sub: `${data.stats.completedGoals} completed`,
          icon: <Activity className="h-6 w-6 text-emerald-600" />,
          color: "bg-emerald-50 border-emerald-100",
        },
        {
          label: "Total Skills",
          value: String(data.stats.totalSkills),
          sub: "tracked skills",
          icon: <CheckCircle2 className="h-6 w-6 text-blue-600" />,
          color: "bg-blue-50 border-blue-100",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans">


      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50/50">

       

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              >
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 flex-1">{error}</p>
                <button onClick={clearError} className="p-1 hover:bg-red-100 rounded-lg">
                  <X className="h-4 w-4 text-red-400" />
                </button>
              </motion.div>
            )}

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">

              {/* Daily Tip */}
              <motion.div variants={itemVariants} className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden group cursor-default">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="flex items-start sm:items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm shadow-sm">
                    <Lightbulb className="h-6 w-6 text-indigo-50" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Daily Tip</h3>
                    <p className="text-indigo-100 text-sm sm:text-base">"The best time to plant a tree was 20 years ago. The second best time is when your code finally compiles."</p>
                  </div>
                </div>
              </motion.div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading && !data
                  ? Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-7 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))
                  : statCards.map((stat, i) => (
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -4 }}
                        key={i}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-2.5 rounded-lg border ${stat.color}`}>{stat.icon}</div>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
                        <div className="flex justify-between items-end">
                          <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
                          <span className="text-slate-400 text-xs">{stat.sub}</span>
                        </div>
                      </motion.div>
                    ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sessions Bar Chart */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Sessions per Week</h3>
                    <Link to="/sessions" className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1">
                      View All <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  {loading && !data ? (
                    <Skeleton className="h-62.5 w-full" />
                  ) : (
                    <div className="h-62.5 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.charts.sessionsPerWeek ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                          <Tooltip
                            cursor={{ fill: "#f8fafc" }}
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                            formatter={(value: number, name: string) => [
                              name === "sessions" ? `${value} sessions` : formatDuration(value),
                              name === "sessions" ? "Sessions" : "Duration",
                            ]}
                          />
                          <Bar dataKey="sessions" radius={[4, 4, 0, 0]} barSize={32}>
                            {(data?.charts.sessionsPerWeek ?? []).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#818cf8" : "#4f46e5"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </motion.div>

                {/* Goal Status Donut */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <h3 className="font-semibold text-slate-800 mb-2">Goal Status</h3>
                  {loading && !data ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Skeleton className="h-40 w-40 rounded-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 flex items-center justify-center relative min-h-50">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={data?.charts.goalStatus ?? []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                              {(data?.charts.goalStatus ?? []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="text-3xl font-bold text-slate-800">
                            {data?.charts.goalStatus.reduce((s, g) => s + g.value, 0) ?? 0}
                          </span>
                          <span className="text-xs text-slate-500 font-medium uppercase">Total Goals</span>
                        </div>
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        {(data?.charts.goalStatus ?? []).map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              {/* Heatmap + Skill Tiers */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Heatmap */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-800">Activity Heatmap</h3>
                    <span className="text-xs text-slate-500 font-medium">Last 12 Weeks</span>
                  </div>
                  <div className="overflow-x-auto pb-2">
                    <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-max">
                      {heatmapGrid.map((val, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(val)} cursor-pointer border border-black/5`}
                          title={`${val} session${val !== 1 ? "s" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                      {["bg-slate-100", "bg-indigo-200", "bg-indigo-300", "bg-indigo-400", "bg-indigo-500"].map((c) => (
                        <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
                      ))}
                    </div>
                    <span>More</span>
                  </div>
                </motion.div>

                {/* Skill Tier Distribution */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-800 mb-6">Skill Tier Distribution</h3>
                  {loading && !data ? (
                    <div className="space-y-5">
                      {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {(data?.charts.skillTiers ?? []).map((tier, i) => {
                        const totalSkills = data?.stats.totalSkills ?? 1;
                        const pct = Math.round((tier.count / totalSkills) * 100);
                        return (
                          <div key={i} className="group">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium text-slate-700 capitalize group-hover:text-indigo-600 transition-colors">
                                {tier._id}
                              </span>
                              <span className="text-slate-500 text-xs">{tier.count} skill{tier.count !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${pct}%` }}
                                transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                viewport={{ once: true }}
                                className={`h-2 rounded-full ${TIER_COLORS[tier._id] ?? "bg-indigo-400"}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Recent Sessions + Pinned Goals */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Sessions */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Recent Sessions</h3>
                    <Link to="/sessions" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All</Link>
                  </div>
                  {loading && !data ? (
                    <div className="space-y-3">
                      {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : (data?.widgets.recentSessions ?? []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Clock className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                      <p className="text-sm">No sessions yet. Start coding!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(data?.widgets.recentSessions ?? []).map((session) => (
                        <motion.div
                          key={session._id}
                          whileHover={{ x: 4, backgroundColor: "rgb(248 250 252)" }}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-100 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <Terminal className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{session.title}</p>
                              <p className="text-xs text-slate-500">{formatDate(session.date)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-semibold text-slate-700 text-sm">{formatDuration(session.duration)}</p>
                            {session.tags.length > 0 && (
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {session.tags[0]}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Pinned Goals */}
                <motion.div variants={itemVariants} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800">Pinned Goals</h3>
                    <Link to="/goals" className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                      <Plus className="h-5 w-5" />
                    </Link>
                  </div>
                  {loading && !data ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                  ) : (data?.widgets.pinnedGoals ?? []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Target className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                      <p className="text-sm">No pinned goals yet.</p>
                      <Link to="/goals" className="text-indigo-600 text-xs font-medium hover:underline mt-1 inline-block">
                        Pin a goal →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(data?.widgets.pinnedGoals ?? []).map((goal, i) => {
                        const color = goal.color
                          ? GOAL_COLORS[goal.color] ?? DEFAULT_GOAL_COLORS[i % DEFAULT_GOAL_COLORS.length]
                          : DEFAULT_GOAL_COLORS[i % DEFAULT_GOAL_COLORS.length];
                        const daysLeft = goal.deadline
                          ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000))
                          : null;
                        return (
                          <Link
                            to="/goals"
                            key={goal._id}
                            className="block p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer group"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">
                                {goal.title}
                              </h4>
                              {daysLeft !== null && (
                                <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm shrink-0 ml-2">
                                  {daysLeft}d left
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${goal.progress ?? 0}%` }}
                                  transition={{ duration: 1, delay: 0.2 }}
                                  viewport={{ once: true }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{goal.progress ?? 0}%</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </div>

            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};