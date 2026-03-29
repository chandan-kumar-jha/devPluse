import { useState, useMemo, useEffect, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

import type { Session, FormData } from "../../types/Sessions.type";
import { useSessionStore } from "../../store/Sessionstore";
import { SessionTimer } from "./SessionTimer";
import { SessionFilterBar } from "./SessionFilterBar";
import { SessionGroup } from "./SessionGroup";
import { SessionFormModal } from "./SessionFormModal";

export const Sessions = () => {

  // ── Store ──────────────────────────────────────────────────────
  const {
    sessions,
    isLoading,
    isSaving,
    isDeleting,
    error: storeError,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    clearError,
  } = useSessionStore();

  // ── Local UI state (client-side filter — not persisted) ────────
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);

  // ── Timer state ────────────────────────────────────────────────
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // ── Form modal state ───────────────────────────────────────────
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // ── Form fields ────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    title: "",
    duration: 0,
    date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
    tags: [],
    goalId: "",
    skillId: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [formError, setFormError] = useState("");

  // ── Fetch on mount ─────────────────────────────────────────────
  useEffect(() => {
    fetchSessions({ sort: "newest", limit: 50 });
  }, [fetchSessions]);

  // ── Timer tick ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleToggle = (tag: string) => {
    setActiveTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // ── Handlers ───────────────────────────────────────────────────
  const openLogModal = (session?: Session) => {
    setFormError("");
    clearError();
    setTagInput("");
    if (session) {
      setEditingSessionId(session.id);
      setFormData({
        title: session.title,
        duration: session.duration,
        date: session.date.split("T")[0],
        notes: session.notes || "",
        tags: session.tags || [],
        goalId: (session.goalId as string) || "",
        skillId: (session.skillId as string) || "",
      });
    } else {
      setEditingSessionId(null);
      setFormData({
        title: "",
        duration: Math.max(1, Math.floor(timerSeconds / 60)),
        date: format(new Date(), "yyyy-MM-dd"),
        notes: "",
        tags: [],
        goalId: "",
        skillId: "",
      });
    }
    setIsLogModalOpen(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    openLogModal();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (
        newTag &&
        formData.tags.length < 10 &&
        !formData.tags.includes(newTag)
      ) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSaveSession = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    // ── Client-side validation — mirrors Zod createSessionSchema exactly ──
    if (!formData.title.trim())
      return setFormError("Title is required.");
    if (formData.title.length > 120)
      return setFormError("Title must be at most 120 characters.");

    const durationNum = Math.floor(Number(formData.duration));
    if (!formData.duration || isNaN(durationNum) || durationNum < 1)
      return setFormError("Duration must be at least 1 minute.");
    if (durationNum > 1440)
      return setFormError("Duration cannot exceed 1440 minutes (24 hours).");

    if (!formData.date)
      return setFormError("Date is required.");
    if (new Date(formData.date) > new Date())
      return setFormError("Date cannot be in the future.");

    if (formData.notes.length > 2000)
      return setFormError("Notes must be at most 2000 characters.");
    if (formData.tags.length > 10)
      return setFormError("Maximum 10 tags allowed.");

    // Build a payload that satisfies the Zod createSessionSchema exactly:
    //   duration  — must be a JS number (z.number()); parseInt can return NaN
    //               on empty input so we coerce via Math.floor and guard below.
    //   date      — send as "yyyy-MM-dd"; backend does new Date(val) itself.
    //               Pre-converting to ISO risks timezone drift (IST midnight
    //               becomes previous UTC day).
    //   goalId /
    //   skillId   — schema regex /^[a-f\d]{24}$/i; empty string "" fails it,
    //               so we must pass undefined (not "") when unset.
    //   tags      — backend lowercases on save; lowercase here too so the
    //               optimistic store value matches what the DB will return.
    const duration = Math.floor(Number(formData.duration));
    const payload = {
      title: formData.title.trim(),
      duration,                                          // guaranteed integer
      date: formData.date,                               // "yyyy-MM-dd"
      notes: formData.notes.trim() || undefined,         // omit if empty
      tags: formData.tags.map((t) => t.toLowerCase().trim()),
      goalId: formData.goalId || undefined,              // never send ""
      skillId: formData.skillId || undefined,            // never send ""
    };

    try {
      if (editingSessionId) {
        await updateSession(editingSessionId, payload);
      } else {
        await createSession(payload);
        setTimerSeconds(0); // reset timer after logging
      }
      setIsLogModalOpen(false);
    } catch (err: any) {
      // Store already sets storeError; surface it in the form too
      setFormError(err.message ?? "Something went wrong. Please try again.");
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(id);
    } catch {
      // storeError will surface the message
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTagsFilter((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Derived state (client-side filter over the store list)
  // Backend stores tags lowercased. Capitalise for display (e.g. "react" -> "React").
  const allAvailableTags = useMemo(() => {
    const tags = new Set<string>();
    sessions.forEach((s) => s.tags.forEach((t) => tags.add(t.toLowerCase())));
    return Array.from(tags)
      .sort()
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        const matchesSearch =
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.notes?.toLowerCase().includes(searchQuery.toLowerCase());
        // Case-insensitive tag match — backend stores lowercase, pills show capitalised
        const matchesTags =
          selectedTagsFilter.length === 0 ||
          selectedTagsFilter.every((tag) =>
            s.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
          );
        return matchesSearch && matchesTags;
      })
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [sessions, searchQuery, selectedTagsFilter]);

  const groupedSessions = useMemo(() => {
    const groups: Record<string, Session[]> = {};
    filteredSessions.forEach((session) => {
      const dateObj = parseISO(session.date);
      let groupKey = format(dateObj, "MMM d, yyyy");
      if (isToday(dateObj)) groupKey = "Today";
      else if (isYesterday(dateObj)) groupKey = "Yesterday";
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(session);
    });
    return groups;
  }, [filteredSessions]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10 flex-shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Session Timeline</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => openLogModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Log Session
            </button>
          </div>
        </header>

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Global store error banner */}
            {storeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between font-medium">
                <span>{storeError}</span>
                <button
                  onClick={clearError}
                  className="ml-4 text-red-400 hover:text-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Sticky timer & filter bar */}
            <div className="sticky top-0 z-10 space-y-4 pb-4 bg-slate-50/90 backdrop-blur-md">
              {isTimerRunning && (
                <SessionTimer
                  timerSeconds={timerSeconds}
                  onStop={handleStopTimer}
                />
              )}
              <SessionFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                allAvailableTags={allAvailableTags}
                selectedTagsFilter={selectedTagsFilter}
                onTagToggle={handleTagToggle}
                onClearTags={() => setSelectedTagsFilter([])}
              />
            </div>

            {/* Sessions timeline */}
            <div className="space-y-8">
              {isLoading ? (
                /* Loading skeleton — same card shape, UI unchanged */
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm animate-pulse"
                    >
                      <div className="flex gap-6">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-slate-100 rounded w-1/3" />
                          <div className="h-3 bg-slate-100 rounded w-2/3" />
                          <div className="flex gap-2">
                            <div className="h-5 w-16 bg-slate-100 rounded-md" />
                            <div className="h-5 w-20 bg-slate-100 rounded-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : Object.entries(groupedSessions).length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-white border border-slate-200 rounded-2xl border-dashed">
                  <Search className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-700 mb-1">No sessions found</p>
                  <p className="text-sm">Try adjusting your search or tag filters.</p>
                </div>
              ) : (
                Object.entries(groupedSessions).map(([dateLabel, dateSessions]) => (
                  <SessionGroup
                    key={dateLabel}
                    dateLabel={dateLabel}
                    sessions={dateSessions}
                    onEdit={openLogModal}
                    onDelete={handleDeleteSession}
                    deletingId={isDeleting}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Form modal */}
      <SessionFormModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleSaveSession}
        editingSessionId={editingSessionId}
        formData={formData}
        setFormData={setFormData}
        tagInput={tagInput}
        setTagInput={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={removeTag}
        formError={formError}
        isSaving={isSaving}
      />
    </div>
  );
};
