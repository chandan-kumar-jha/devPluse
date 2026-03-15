import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Layout from "../components/Layout"
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "../hooks/useGoals"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { setGoalStatus } from "../store/slices/filterSlice"

const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  targetDate: z.string().optional(),
})

type GoalForm = z.infer<typeof goalSchema>

interface Milestone {
  text: string
  completed: boolean
}

interface Goal {
  _id: string
  title: string
  description?: string
  status: "active" | "completed" | "abandoned"
  targetDate?: string
  milestones: Milestone[]
}

const statusTabs = ["all", "active", "completed", "abandoned"] as const
type GoalStatus = typeof statusTabs[number]

const statusBadge: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#E6F1FB", color: "#185FA5" },
  completed: { bg: "#EAF3DE", color: "#3B6D11" },
  abandoned: { bg: "#F1EFE8", color: "#5F5E5A" },
}

const getDaysRemaining = (targetDate?: string) => {
  if (!targetDate) return null
  const diff = new Date(targetDate).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const getProgressBadge = (pct: number, days: number | null) => {
  if (days !== null && days < 0) return { label: "Overdue",     bg: "#FCEBEB", color: "#A32D2D" }
  if (pct >= 66)                  return { label: "On track",    bg: "#EAF3DE", color: "#3B6D11" }
  if (pct >= 33)                  return { label: "Needs focus", bg: "#FAEEDA", color: "#854F0B" }
  return                                 { label: "Just started", bg: "#E6F1FB", color: "#185FA5" }
}

const GoalsPage = () => {
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [showModal, setShowModal]       = useState(false)
  const [toast, setToast]               = useState<string | null>(null)
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>([""])

  const dispatch    = useAppDispatch()
  const goalStatus  = useAppSelector((state) => state.filter.goalStatus)

  const { data: goals = [], isLoading } = useGoals()
  const { mutate: createGoal, isPending: isCreating } = useCreateGoal()
  const { mutate: updateGoal } = useUpdateGoal()
  const { mutate: deleteGoal } = useDeleteGoal()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GoalForm>({ resolver: zodResolver(goalSchema) })

  const allGoals     = goals as Goal[]
  const selectedGoal = allGoals.find((g) => g._id === selectedId) ?? null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const onSubmit = (data: GoalForm) => {
    const milestones = milestoneInputs
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text, completed: false }))

    createGoal(
      { ...data, milestones },
      {
        onSuccess: () => {
          reset()
          setMilestoneInputs([""])
          setShowModal(false)
          showToast(`Goal "${data.title}" created!`)
        },
      }
    )
  }

  const toggleMilestone = (goal: Goal, index: number) => {
    const updated = goal.milestones.map((m, i) =>
      i === index ? { ...m, completed: !m.completed } : m
    )
    updateGoal({ id: goal._id, data: { milestones: updated } })
  }

  const logProgress = (goal: Goal) => {
  const total = goal.milestones.length
  if (total === 0) return
  const nextIndex = goal.milestones.findIndex((m) => !m.completed)
  if (nextIndex === -1) return
  const updated = goal.milestones.map((m, i) =>
    i === nextIndex ? { ...m, completed: true } : m
  )
  updateGoal({ id: goal._id, data: { milestones: updated } })
}

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">Goals</h1>
            <p className="text-sm text-gray-400 mt-1">Set and track your dev goals</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{ background: "#7F77DD" }}
          >
            + New goal
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: "#EAF3DE", color: "#3B6D11", border: "1px solid #97C459" }}
          >
            {toast}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg w-fit border border-gray-800">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => dispatch(setGoalStatus(tab as GoalStatus))}
              className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition"
              style={
                goalStatus === tab
                  ? { background: "#7F77DD", color: "#fff" }
                  : { background: "transparent", color: "#9CA3AF" }
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading goals...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Goal Cards */}
            <div className="lg:col-span-1 space-y-3">
              {allGoals.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  No goals found. Create one!
                </div>
              ) : (
                allGoals.map((g) => {
                  const total = g.milestones.length
                  const done  = g.milestones.filter((m) => m.completed).length
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                  const days  = getDaysRemaining(g.targetDate)
                  const badge = getProgressBadge(pct, days)
                  const isSelected = selectedId === g._id

                  return (
                    <div
                      key={g._id}
                      onClick={() => setSelectedId(isSelected ? null : g._id)}
                      className="bg-gray-900 rounded-xl border p-4 cursor-pointer transition group"
                      style={{
                        borderColor: isSelected ? "#7F77DD" : "#1F2937",
                        boxShadow: isSelected ? "0 0 0 1px #7F77DD" : "none",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-white leading-snug flex-1">
                          {g.title}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-gray-800 rounded-full mb-2">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 66 ? "#1D9E75" : pct >= 33 ? "#7F77DD" : "#378ADD",
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{pct}% complete</span>
                        {days !== null && (
                          <span style={{ color: days < 0 ? "#E24B4A" : "#6B7280" }}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                          </span>
                        )}
                      </div>

                      {/* Status badge */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: statusBadge[g.status].bg,
                            color: statusBadge[g.status].color,
                          }}
                        >
                          {g.status}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteGoal(g._id) }}
                          className="text-gray-600 hover:text-red-400 transition text-xs opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Detail Panel */}
            <div className="lg:col-span-2">
              {!selectedGoal ? (
                <div
                  className="bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center"
                  style={{ minHeight: 320 }}
                >
                  <p className="text-gray-500 text-sm">Select a goal to see details</p>
                </div>
              ) : (() => {
                const total = selectedGoal.milestones.length
                const done  = selectedGoal.milestones.filter((m) => m.completed).length
                const pct   = total > 0 ? Math.round((done / total) * 100) : 0
                const days  = getDaysRemaining(selectedGoal.targetDate)
                const badge = getProgressBadge(pct, days)

                return (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">

                    {/* Detail header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <h2 className="text-base font-medium text-white mb-1">
                          {selectedGoal.title}
                        </h2>
                        {selectedGoal.description && (
                          <p className="text-sm text-gray-400">{selectedGoal.description}</p>
                        )}
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>{done}/{total} milestones</span>
                        <span className="font-medium text-white">{pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct >= 66 ? "#1D9E75" : pct >= 33 ? "#7F77DD" : "#378ADD",
                          }}
                        />
                      </div>
                      {selectedGoal.targetDate && (
                        <p className="text-xs text-gray-500 mt-1.5">
                          Due {new Date(selectedGoal.targetDate).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                          {days !== null && (
                            <span style={{ color: days < 0 ? "#E24B4A" : "#6B7280" }}>
                              {" "}— {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
                            </span>
                          )}
                        </p>
                      )}
                    </div>

                    {/* Milestones */}
                    {selectedGoal.milestones.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                          Milestones
                        </p>
                        <div className="space-y-2">
                          {selectedGoal.milestones.map((m, i) => (
                            <button
                              key={i}
                              onClick={() => toggleMilestone(selectedGoal, i)}
                              className="flex items-center gap-3 w-full text-left p-2.5 rounded-lg transition hover:bg-gray-800 group/m"
                            >
                              <span
                                className="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition"
                                style={{
                                  background: m.completed ? "#7F77DD" : "transparent",
                                  borderColor: m.completed ? "#7F77DD" : "#4B5563",
                                }}
                              >
                                {m.completed && (
                                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </span>
                              <span
                                className="text-sm transition"
                                style={{
                                  color: m.completed ? "#6B7280" : "#E5E7EB",
                                  textDecoration: m.completed ? "line-through" : "none",
                                }}
                              >
                                {m.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-800 flex-wrap">
                      <button
                        onClick={() => logProgress(selectedGoal)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition"
                        style={{ background: "#7F77DD" }}
                      >
                        + Log progress
                      </button>

                      {selectedGoal.status === "active" && (
                        <button
                          onClick={() => updateGoal({ id: selectedGoal._id, data: { status: "completed" } })}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition"
                          style={{ background: "#EAF3DE", color: "#3B6D11" }}
                        >
                          Mark complete
                        </button>
                      )}

                      {selectedGoal.status === "active" && (
                        <button
                          onClick={() => updateGoal({ id: selectedGoal._id, data: { status: "abandoned" } })}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition"
                          style={{ background: "#1F2937", color: "#9CA3AF" }}
                        >
                          Abandon
                        </button>
                      )}

                      {selectedGoal.status !== "active" && (
                        <button
                          onClick={() => updateGoal({ id: selectedGoal._id, data: { status: "active" } })}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition"
                          style={{ background: "#E6F1FB", color: "#185FA5" }}
                        >
                          Reopen
                        </button>
                      )}
                    </div>

                  </div>
                )
              })()}
            </div>

          </div>
        )}

        {/* New Goal Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-medium text-white">New goal</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-white transition text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Title</label>
                  <input
                    {...register("title")}
                    placeholder="What do you want to achieve?"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    placeholder="Optional details..."
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Target date</label>
                  <input
                    {...register("targetDate")}
                    type="date"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Milestones <span className="text-gray-600">(optional)</span>
                  </label>
                  <div className="space-y-2">
                    {milestoneInputs.map((val, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={val}
                          onChange={(e) =>
                            setMilestoneInputs((prev) =>
                              prev.map((m, idx) => idx === i ? e.target.value : m)
                            )
                          }
                          placeholder={`Milestone ${i + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                        />
                        {milestoneInputs.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setMilestoneInputs((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className="text-gray-500 hover:text-red-400 transition px-2"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMilestoneInputs((prev) => [...prev, ""])}
                    className="mt-2 text-xs transition"
                    style={{ color: "#7F77DD" }}
                  >
                    + Add milestone
                  </button>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                    style={{ background: "#7F77DD" }}
                  >
                    {isCreating ? "Saving..." : "Create goal"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  )
}

export default GoalsPage