import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Layout from "../components/Layout"
import { useSkills, useUpsertSkill, useLevelUpSkill } from "../hooks/useSkills"

const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required").max(60),
  category: z.enum(["language", "framework", "tool", "concept", "other"]),
  currentLevel: z.string().min(1, "Level is required"),
  targetLevel: z.string().optional(),
  notes: z.string().max(500).optional(),
})

type SkillForm = z.infer<typeof skillSchema>

interface Skill {
  _id: string
  name: string
  category: "language" | "framework" | "tool" | "concept" | "other"
  currentLevel: number
  targetLevel?: number
  notes?: string
}

const categoryColor: Record<string, { bar: string; bg: string; color: string }> = {
  language:  { bar: "#7F77DD", bg: "#EEEDFE", color: "#534AB7" },
  framework: { bar: "#1D9E75", bg: "#E1F5EE", color: "#0F6E56" },
  tool:      { bar: "#EF9F27", bg: "#FAEEDA", color: "#854F0B" },
  concept:   { bar: "#378ADD", bg: "#E6F1FB", color: "#185FA5" },
  other:     { bar: "#888780", bg: "#F1EFE8", color: "#5F5E5A" },
}

const getLevelBadge = (level: number) => {
  if (level >= 80) return { label: "Expert",       bg: "#EEEDFE", color: "#534AB7" }
  if (level >= 60) return { label: "Advanced",     bg: "#EAF3DE", color: "#3B6D11" }
  if (level >= 40) return { label: "Intermediate", bg: "#FAEEDA", color: "#854F0B" }
  if (level >= 20) return { label: "Beginner",     bg: "#E6F1FB", color: "#185FA5" }
  return                  { label: "Novice",        bg: "#F1EFE8", color: "#5F5E5A" }
}

const LEVEL_TIERS = ["all", "novice", "beginner", "intermediate", "advanced", "expert"] as const
type LevelTier = typeof LEVEL_TIERS[number]

const SORT_OPTIONS = [
  { value: "level-desc", label: "Highest level" },
  { value: "level-asc",  label: "Lowest level"  },
  { value: "name-asc",   label: "A – Z"         },
  { value: "name-desc",  label: "Z – A"         },
]

const getRelated = (skill: Skill, all: Skill[]) =>
  all
    .filter((s) => s._id !== skill._id && s.category === skill.category)
    .slice(0, 4)

const SkillsPage = () => {
  const [search, setSearch]         = useState("")
  const [sort, setSort]             = useState("level-desc")
  const [tier, setTier]             = useState<LevelTier>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showModal, setShowModal]   = useState(false)
  const [toast, setToast]           = useState<string | null>(null)
  const [levelUpMsg, setLevelUpMsg] = useState<string | null>(null)

  const { data: skills = [], isLoading } = useSkills()
  const { mutate: upsertSkill, isPending: isUpserting } = useUpsertSkill()
  const { mutate: levelUp } = useLevelUpSkill()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillForm>({
    resolver: zodResolver(skillSchema),
    defaultValues: { category: "other", currentLevel: "0" },
  })

 const allSkills = useMemo(() => [...(skills as Skill[])], [skills])
const selectedSkill = allSkills.find((s) => s._id === selectedId) ?? null

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const showLevelUp = (msg: string) => {
    setLevelUpMsg(msg)
    setTimeout(() => setLevelUpMsg(null), 3000)
  }

  const handleLevelUp = (skill: Skill) => {
    const prevBadge = getLevelBadge(skill.currentLevel).label
    levelUp(
      { id: skill._id, increment: 5 },
      {
        onSuccess: () => {
          const newLevel = Math.min(100, skill.currentLevel + 5)
          const newBadge = getLevelBadge(newLevel).label
          if (newBadge !== prevBadge) {
            showLevelUp(`Level up! ${skill.name} is now ${newBadge}`)
          }
        },
      }
    )
  }
const filtered = useMemo(() => {
  let list = allSkills  // no [...allSkills] needed anymore

  if (search.trim()) {
    const q = search.toLowerCase()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    )
  }

  if (tier !== "all") {
    list = list.filter(
      (s) => getLevelBadge(s.currentLevel).label.toLowerCase() === tier
    )
  }

  const sorted = [...list]
  sorted.sort((a, b) => {
    if (sort === "level-desc") return b.currentLevel - a.currentLevel
    if (sort === "level-asc")  return a.currentLevel - b.currentLevel
    if (sort === "name-asc")   return a.name.localeCompare(b.name)
    if (sort === "name-desc")  return b.name.localeCompare(a.name)
    return 0
  })

  return sorted
  
}, [allSkills, search, tier, sort])

  const onSubmit = (data: SkillForm) => {
    upsertSkill(
      {
        ...data,
        currentLevel: parseInt(data.currentLevel, 10),
        targetLevel: data.targetLevel ? parseInt(data.targetLevel, 10) : undefined,
      },
      {
        onSuccess: () => {
          reset()
          setShowModal(false)
          showToast(`Skill "${data.name}" added!`)
        },
      }
    )
  }

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-white">Skills</h1>
            <p className="text-sm text-gray-400 mt-1">Track your technical skill levels</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{ background: "#7F77DD" }}
          >
            + Add skill
          </button>
        </div>

        {/* Level up banner */}
        {levelUpMsg && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: "#EEEDFE", color: "#534AB7", border: "1px solid #AFA9EC" }}
          >
            🎉 {levelUpMsg}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className="mb-4 px-4 py-3 rounded-lg text-sm font-medium"
            style={{ background: "#EAF3DE", color: "#3B6D11", border: "1px solid #97C459" }}
          >
            {toast}
          </div>
        )}

        {/* Search + Sort */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Tier filter tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg w-fit border border-gray-800 flex-wrap">
          {LEVEL_TIERS.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className="px-3 py-1.5 rounded-md text-xs font-medium capitalize transition"
              style={
                tier === t
                  ? { background: "#7F77DD", color: "#fff" }
                  : { background: "transparent", color: "#9CA3AF" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500 text-sm">Loading skills...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Skills Grid */}
            <div className="lg:col-span-2">
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-500 text-sm">
                  No skills found. Try a different search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((skill) => {
                    const badge = getLevelBadge(skill.currentLevel)
                    const cc    = categoryColor[skill.category] ?? categoryColor.other
                    const isSelected = selectedId === skill._id

                    return (
                      <div
                        key={skill._id}
                        onClick={() => setSelectedId(isSelected ? null : skill._id)}
                        className="bg-gray-900 rounded-xl border p-4 cursor-pointer transition group"
                        style={{
                          borderColor: isSelected ? "#7F77DD" : "#1F2937",
                          boxShadow: isSelected ? "0 0 0 1px #7F77DD" : "none",
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">{skill.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{skill.category}</p>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <div
                          className="w-full h-1.5 rounded-full mb-2"
                          style={{ background: "#1F2937" }}
                        >
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${skill.currentLevel}%`, background: cc.bar }}
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

            {/* Detail Panel */}
            <div className="lg:col-span-1">
              {!selectedSkill ? (
                <div
                  className="bg-gray-900 rounded-xl border border-gray-800 flex items-center justify-center"
                  style={{ minHeight: 320 }}
                >
                  <p className="text-gray-500 text-sm">Select a skill to see details</p>
                </div>
              ) : (() => {
                const badge   = getLevelBadge(selectedSkill.currentLevel)
                const cc      = categoryColor[selectedSkill.category] ?? categoryColor.other
                const related = getRelated(selectedSkill, allSkills)

                return (
                  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 sticky top-8">

                    {/* Skill header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h2 className="text-base font-medium text-white">{selectedSkill.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">{selectedSkill.category}</p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Current level</span>
                        <span className="font-medium text-white">{selectedSkill.currentLevel}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full mb-1">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedSkill.currentLevel}%`, background: cc.bar }}
                        />
                      </div>
                      {selectedSkill.targetLevel && (
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Target</span>
                          <span>{selectedSkill.targetLevel}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {selectedSkill.notes && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-400 leading-relaxed">{selectedSkill.notes}</p>
                      </div>
                    )}

                    {/* Related skills */}
                    {related.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-medium">
                          Related
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {related.map((r) => (
                            <button
                              key={r._id}
                              onClick={() => setSelectedId(r._id)}
                              className="text-xs px-2.5 py-1 rounded-full border transition hover:border-indigo-500 hover:text-indigo-400"
                              style={{ borderColor: "#374151", color: "#9CA3AF" }}
                            >
                              {r.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => handleLevelUp(selectedSkill)}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition"
                        style={{ background: "#7F77DD" }}
                      >
                        + Level up (×5)
                      </button>
                      <button
                        onClick={() => showToast(`${selectedSkill.name} linked to active goal!`)}
                        className="w-full px-4 py-2 rounded-lg text-sm font-medium transition"
                        style={{ background: "#1F2937", color: "#9CA3AF" }}
                      >
                        Link to goal
                      </button>
                    </div>

                  </div>
                )
              })()}
            </div>

          </div>
        )}

        {/* Add Skill Modal */}
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
          >
            <div className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-medium text-white">Add skill</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Skill name</label>
                  <input
                    {...register("name")}
                    placeholder="e.g. TypeScript"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Category</label>
                  <select
                    {...register("category")}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="language">Language</option>
                    <option value="framework">Framework</option>
                    <option value="tool">Tool</option>
                    <option value="concept">Concept</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Current level <span className="text-gray-600">(0–100)</span>
                    </label>
                    <input
                      {...register("currentLevel")}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                    {errors.currentLevel && (
                      <p className="mt-1 text-xs text-red-400">{errors.currentLevel.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      Target level <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      {...register("targetLevel")}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 80"
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                  <textarea
                    {...register("notes")}
                    rows={2}
                    placeholder="Resources, progress notes..."
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpserting}
                    className="px-5 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50"
                    style={{ background: "#7F77DD" }}
                  >
                    {isUpserting ? "Saving..." : "Add skill"}
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

export default SkillsPage