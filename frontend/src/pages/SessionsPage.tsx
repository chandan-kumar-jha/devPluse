import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Layout from "../components/Layout"
import { useSessions, useCreateSession, useDeleteSession } from "../hooks/useSessions"

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  date: z.string().min(1, "Date is required"),
  durationMinutes: z.string().min(1, "Duration is required"),
  tags: z.array(z.string()).optional(),
  notes: z.string().min(10, "Notes must be at least 10 characters").max(2000).optional().or(z.literal("")),
  mood: z.enum(["great", "good", "okay", "bad"]).optional(),
})

type SessionForm = z.infer<typeof sessionSchema>

interface Session {
  _id: string
  title: string
  date: string
  durationMinutes: number
  mood?: "great" | "good" | "okay" | "bad"
  tags: string[]
  notes?: string
}

const SKILL_TAGS = [
  "TypeScript", "React", "Node.js", "MongoDB",
  "Express", "Redux", "Zod", "TanStack Query",
]

const moodOptions: { value: "great" | "good" | "okay" | "bad"; label: string; color: string; active: string }[] = [
  { value: "great", label: "Great", color: "border-gray-700 text-gray-400 hover:border-emerald-500 hover:text-emerald-400", active: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
  { value: "good",  label: "Good",  color: "border-gray-700 text-gray-400 hover:border-indigo-500 hover:text-indigo-400",  active: "border-indigo-500 bg-indigo-500/10 text-indigo-400"  },
  { value: "okay",  label: "Okay",  color: "border-gray-700 text-gray-400 hover:border-yellow-500 hover:text-yellow-400",  active: "border-yellow-500 bg-yellow-500/10 text-yellow-400"  },
  { value: "bad",   label: "Bad",   color: "border-gray-700 text-gray-400 hover:border-red-500 hover:text-red-400",         active: "border-red-500 bg-red-500/10 text-red-400"           },
]

const moodDot: Record<string, string> = {
  great: "#1D9E75",
  good:  "#7F77DD",
  okay:  "#EF9F27",
  bad:   "#E24B4A",
}

const formatDur = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const SessionsPage = () => {
  const [showForm, setShowForm]       = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [duration, setDuration]       = useState(90)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedMood, setSelectedMood] = useState<"great" | "good" | "okay" | "bad" | "">("")

  const { data: sessions = [], isLoading } = useSessions()
  const { mutate: createSession, isPending: isCreating } = useCreateSession()
  const { mutate: deleteSession } = useDeleteSession()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionForm>({
    resolver: zodResolver(sessionSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0] },
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const onSubmit = (data: SessionForm) => {
    const payload = {
      title: data.title,
      date: data.date,
      durationMinutes: parseInt(data.durationMinutes, 10),
      tags: selectedTags,
      notes: data.notes || undefined,
      mood: selectedMood || undefined,
    }

    createSession(payload, {
      onSuccess: () => {
        reset()
        setSelectedTags([])
        setSelectedMood("")
        setDuration(90)
        setShowForm(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      },
    })
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">Log session</h1>
            <p className="text-sm text-gray-400 mt-1">Record what you worked on</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setShowSuccess(false) }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{ background: showForm ? "#1F2937" : "#7F77DD", color: "#fff" }}
          >
            {showForm ? "Cancel" : "+ Log Session"}
          </button>
        </div>

        {/* Success banner */}
        {showSuccess && (
          <div
            className="mb-5 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: "#EAF3DE", color: "#3B6D11", border: "1px solid #97C459" }}
          >
            Session logged successfully!
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5">
                    What did you work on?
                  </label>
                  <input
                    {...register("title")}
                    placeholder="e.g. Built auth routes and tested in Postman"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
                  )}
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Date</label>
                  <input
                    {...register("date")}
                    type="date"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>
                  )}
                </div>

                {/* Duration slider */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">
                    Duration —{" "}
                    <span className="text-white font-medium">{formatDur(duration)}</span>
                  </label>
                  <input
                    {...register("durationMinutes")}
                    type="range"
                    min={15}
                    max={480}
                    step={15}
                    value={duration}
                    onChange={(e) => {
                      setDuration(parseInt(e.target.value, 10))
                    }}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>15m</span>
                    <span>8h</span>
                  </div>
                </div>

              </div>

              {/* Skill tags */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Skill tags</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className="text-xs px-3 py-1.5 rounded-full border transition"
                      style={
                        selectedTags.includes(tag)
                          ? { background: "#EEEDFE", color: "#534AB7", borderColor: "#AFA9EC" }
                          : { background: "transparent", color: "#9CA3AF", borderColor: "#374151" }
                      }
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-2">Mood</label>
                <div className="flex gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setSelectedMood(m.value)}
                      className={`text-xs px-4 py-1.5 rounded-full border transition ${
                        selectedMood === m.value ? m.active : m.color
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-5">
                <label className="block text-xs text-gray-400 mb-1.5">
                  Notes <span className="text-gray-600">(optional)</span>
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  placeholder="What did you learn or build?"
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                />
                {errors.notes && (
                  <p className="mt-1 text-xs text-red-400">{errors.notes.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                style={{ background: "#7F77DD" }}
              >
                {isCreating ? "Saving..." : "Log session"}
              </button>

            </form>
          </div>
        )}

        {/* Sessions list */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading sessions...</div>
        ) : (sessions as Session[]).length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-base mb-1">No sessions yet</p>
            <p className="text-sm">Click "Log Session" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(sessions as Session[]).map((s) => (
              <div
                key={s._id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-4 flex items-start justify-between gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-sm font-medium text-white">{s.title}</h3>
                    {s.mood && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: moodDot[s.mood] }}
                        title={s.mood}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    {new Date(s.date).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })} · {formatDur(s.durationMinutes)}
                  </p>
                  {s.notes && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{s.notes}</p>
                  )}
                  {s.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {s.tags.map((tag) => (
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

                <button
                  onClick={() => deleteSession(s._id)}
                  className="text-gray-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 shrink-0 text-base"
                  title="Delete session"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  )
}

export default SessionsPage