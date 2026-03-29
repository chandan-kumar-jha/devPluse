import { FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Edit2,
  X,
  AlertCircle,
  Target,
  Code2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { FormData } from "../../types/Sessions.type";

const MOCK_GOALS = [
  { id: "65f1a5b8e4b0a1b2c3d4e5f6", name: "Legacy Refactor" },
  { id: "65f1a5b8e4b0a1b2c3d4e5f7", name: "Migrate DB" },
  { id: "65f1a5b8e4b0a1b2c3d4e5f8", name: "Interview Prep" }
];

const MOCK_SKILLS = [
  { id: "65f1a5b8e4b0a1b2c3d4e5f9", name: "React" },
  { id: "65f1a5b8e4b0a1b2c3d4e5fa", name: "TypeScript" },
  { id: "65f1a5b8e4b0a1b2c3d4e5fb", name: "PostgreSQL" },
  { id: "65f1a5b8e4b0a1b2c3d4e5fc", name: "Architecture" }
];

type SessionFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  editingSessionId: string | null;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  tagInput: string;
  setTagInput: (value: string) => void;
  onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (tag: string) => void;
  formError: string;
  isSaving: boolean;
};

export const SessionFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingSessionId,
  formData,
  setFormData,
  tagInput,
  setTagInput,
  onAddTag,
  onRemoveTag,
  formError,
  isSaving,
}: SessionFormModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* ── The <form> wraps both the scrollable body AND the footer
               so the submit button is always inside the same form element.
               Using cross-element form="id" + type="submit" is unreliable
               with React's synthetic event system. ─────────────────────── */}
          <form
            onSubmit={onSubmit}
            className="flex flex-col flex-1 min-h-0 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {editingSessionId ? (
                  <Edit2 className="h-5 w-5 text-[#5e43f3]" />
                ) : (
                  <Plus className="h-5 w-5 text-[#5e43f3]" />
                )}
                {editingSessionId ? "Edit Session" : "Log a Session"}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Error banner */}
              {formError && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" /> {formError}
                </div>
              )}

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[15px] font-semibold text-slate-800">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <span className="text-sm text-slate-400">
                      {formData.title.length}/120
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={120}
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="What did you work on? (e.g. Auth API Refactor)"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                {/* Duration & Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={formData.duration || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="30"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors text-slate-800"
                    />
                    <p className="text-[13px] text-slate-500 mt-1.5">
                      Min: 1, Max: 1440 (24h)
                    </p>
                  </div>
                  <div>
                    <label className="block text-[15px] font-semibold text-slate-800 mb-1.5">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors text-slate-800 [color-scheme:light]"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[15px] font-semibold text-slate-800">
                      Notes
                    </label>
                    <span className="text-sm text-slate-400">
                      {formData.notes.length}/2000
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Add detailed reflections, roadblocks, or implementation details..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors resize-none placeholder:text-slate-400 text-slate-800"
                  />
                </div>

                {/* Tags */}
                <div>
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-[15px] font-semibold text-slate-800">
                      Tags
                    </label>
                    <span className="text-sm text-slate-400">
                      {formData.tags.length}/10 tags
                    </span>
                  </div>
                  <div className="w-full bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#5e43f3] focus-within:border-transparent transition-colors p-2 flex flex-wrap gap-2 min-h-[50px]">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1.5 border border-indigo-100"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => onRemoveTag(tag)}
                          className="hover:text-indigo-900 rounded-full p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    {formData.tags.length < 10 && (
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={onAddTag}
                        placeholder={
                          formData.tags.length === 0
                            ? "Type and press Enter to add tags..."
                            : "Add tag..."
                        }
                        className="flex-1 min-w-[200px] bg-transparent border-none focus:outline-none text-base px-2 py-1 placeholder:text-slate-400 text-slate-800"
                      />
                    )}
                  </div>
                </div>

                {/* Goal & Skill links */}
                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goal & Skill links */}
<div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* GOAL SELECT */}
  <div>
    <label className="block text-[15px] font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
      <Target className="h-4 w-4 text-slate-400" /> Link to Goal
    </label>
    <select
      value={formData.goalId || ""}
      onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors text-slate-800"
    >
      <option value="">None</option>
      {MOCK_GOALS.map((goal) => (
        <option key={goal.id} value={goal.id}>
          {goal.name}
        </option>
      ))}
    </select>
  </div>

  {/* SKILL SELECT */}
  <div>
    <label className="block text-[15px] font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
      <Code2 className="h-4 w-4 text-slate-400" /> Link to Skill
    </label>
    <select
      value={formData.skillId || ""}
      onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5e43f3] focus:border-transparent transition-colors text-slate-800"
    >
      <option value="">None</option>
      {MOCK_SKILLS.map((skill) => (
        <option key={skill.id} value={skill.id}>
          {skill.name}
        </option>
      ))}
    </select>
  </div>
</div>
                    
                  </div>
                </div>
              </div>
            

            {/* Footer — inside <form> so type="submit" works natively */}
            <div className="px-6 py-4 flex items-center justify-end gap-4 flex-shrink-0 bg-white border-t border-slate-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-5 py-2.5 font-semibold text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 font-semibold text-white bg-[#5e43f3] hover:bg-[#4a35c4] rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> Save Session Data
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
