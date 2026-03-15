import Layout from "../components/Layout"
import { useSessions } from "../hooks/useSessions"
import { useGoals } from "../hooks/useGoals"
import { useSkills } from "../hooks/useSkills"
import { Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

interface Session {
  _id: string
  title: string
  date: string
  durationMinutes: number
  mood?: "great" | "good" | "okay" | "bad"
  tags: string[]
}

interface Goal {
  _id: string
  title: string
  status: string
  targetDate?: string
  milestones: { text: string; completed: boolean }[]
}

interface Skill {
  _id: string
  name: string
  category: string
  currentLevel: number
  targetLevel?: number
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const moodDot: Record<string, string> = {
  great: "#1D9E75",
  good:  "#7F77DD",
  okay:  "#EF9F27",
  bad:   "#E24B4A",
}

const categoryColor: Record<string, string> = {
  language:  "#7F77DD",
  framework: "#1D9E75",
  tool:      "#EF9F27",
  concept:   "#378ADD",
  other:     "#888780",
}

const skillBadge: Record<string, { bg: string; color: string; label: string }> = {
  language:  { bg: "#EEEDFE", color: "#534AB7", label: "Language" },
  framework: { bg: "#E1F5EE", color: "#0F6E56", label: "Framework" },
  tool:      { bg: "#FAEEDA", color: "#854F0B", label: "Tool" },
  concept:   { bg: "#E6F1FB", color: "#185FA5", label: "Concept" },
  other:     { bg: "#F1EFE8", color: "#5F5E5A", label: "Other" },
}

const formatDur = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const DashboardPage = () => {
  const { data: sessions = [] } = useSessions()
  const { data: goals = [] }    = useGoals()
  const { data: skills = [] }   = useSkills()

  const totalHours = (sessions as Session[]).reduce(
    (acc, s) => acc + s.durationMinutes / 60, 0
  )
  const activeGoals    = (goals as Goal[]).filter((g) => g.status === "active")
  const recentSessions = (sessions as Session[]).slice(0, 5)

  // Bar chart data — hours per day this week
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekData = DAYS.map((day, i) => {
    const mins = (sessions as Session[])
      .filter((s) => {
        const d = new Date(s.date)
        d.setHours(0, 0, 0, 0)
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + i)
        return d.getTime() === dayDate.getTime()
      })
      .reduce((acc, s) => acc + s.durationMinutes, 0)
    return { day, mins, isToday: i === today.getDay() }
  })

  const barData = {
    labels: weekData.map((d) => d.day),
    datasets: [
      {
        data: weekData.map((d) => d.mins),
        backgroundColor: weekData.map((d) =>
          d.isToday ? "#7F77DD" : d.mins > 0 ? "#AFA9EC" : "#374151"
        ),
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) => formatDur(Number(ctx.raw)),
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: { color: "#6B7280", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.05)" },
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
          callback: (v: unknown) => {
            const val = Number(v)
            return val === 0 ? "0" : `${Math.floor(val / 60)}h`
          },
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  }

  // Donut chart data — skill category breakdown
  const catCounts = (skills as Skill[]).reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const donutLabels = Object.keys(catCounts)
  const donutData = {
    labels: donutLabels,
    datasets: [
      {
        data: donutLabels.map((k) => catCounts[k]),
        backgroundColor: donutLabels.map((k) => categoryColor[k] ?? "#888780"),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) =>
            `${ctx.label}: ${ctx.raw} skill${Number(ctx.raw) === 1 ? "" : "s"}`,
        },
      },
    },
    cutout: "62%",
  }

  const stats = [
    { label: "Total sessions", value: sessions.length, suffix: "" },
    { label: "Hours logged",   value: totalHours.toFixed(1), suffix: "h" },
    { label: "Active goals",   value: activeGoals.length, suffix: "" },
    { label: "Skills tracked", value: (skills as Skill[]).length, suffix: "" },
  ]

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-medium text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Your progress at a glance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1.5">{stat.label}</p>
              <p className="text-2xl font-medium text-white">
                {stat.value}
                <span className="text-sm text-gray-400 font-normal">{stat.suffix}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-sm font-medium text-white mb-4">Hours per day — this week</p>
            <div style={{ height: 200 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Donut chart */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-sm font-medium text-white mb-3">Skill breakdown</p>
            {donutLabels.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
                No skills yet
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-3">
                  {donutLabels.map((cat) => (
                    <span key={cat} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: categoryColor[cat] ?? "#888780" }}
                      />
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  ))}
                </div>
                <div style={{ height: 160 }}>
                  <Doughnut data={donutData} options={donutOptions} />
                </div>
              </>
            )}
          </div>

        </div>

        {/* Recent sessions + Active goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Recent Sessions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-sm font-medium text-white mb-4">Recent sessions</p>
            {recentSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No sessions yet. Start logging!</p>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((s: Session) => (
                  <div
                    key={s._id}
                    className="flex items-start justify-between gap-3 p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(s.date).toLocaleDateString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                        })}
                      </p>
                      {s.tags.length > 0 && (
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {s.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "#EEEDFE", color: "#534AB7" }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-400">{formatDur(s.durationMinutes)}</span>
                      {s.mood && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: moodDot[s.mood] }}
                          title={s.mood}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Goals */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-sm font-medium text-white mb-4">Active goals</p>
            {activeGoals.length === 0 ? (
              <p className="text-gray-500 text-sm">No active goals. Set one!</p>
            ) : (
              <div className="space-y-4">
                {(activeGoals as Goal[]).slice(0, 4).map((g: Goal) => {
                  const total = g.milestones.length
                  const done  = g.milestones.filter((m) => m.completed).length
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                  const badge =
                    pct >= 66 ? { label: "On track",    bg: "#EAF3DE", color: "#3B6D11" } :
                    pct >= 33 ? { label: "Needs focus",  bg: "#FAEEDA", color: "#854F0B" } :
                                { label: "Just started", bg: "#E6F1FB", color: "#185FA5" }

                  return (
                    <div key={g._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-white truncate flex-1 mr-2">
                          {g.title}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "#7F77DD" }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{done}/{total} milestones</span>
                        <span>{pct}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Skills */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <p className="text-sm font-medium text-white mb-4">Skills</p>
          {(skills as Skill[]).length === 0 ? (
            <p className="text-gray-500 text-sm">No skills tracked yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(skills as Skill[]).map((skill) => {
                const b = skillBadge[skill.category] ?? skillBadge.other
                return (
                  <div key={skill._id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white truncate">{skill.name}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0"
                        style={{ background: b.bg, color: b.color }}
                      >
                        {b.label}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mb-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${skill.currentLevel}%`,
                          background: categoryColor[skill.category] ?? "#7F77DD",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Level {skill.currentLevel}</span>
                      {skill.targetLevel && <span>Target {skill.targetLevel}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}

export default DashboardPage