// pages/Notifications.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Terminal,
  Bell,
  Settings as SettingsIcon,
  ChevronDown,
  Mail,
  Flame,
  TrendingUp,
  Trophy,
  Target,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { useNotificationsStore } from "../store/Usenotificationsstore";
import type { NotificationType } from "../api/notifications.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "goal":    return <Target   className="h-5 w-5 text-blue-600" />;
    case "streak":  return <Flame    className="h-5 w-5 text-orange-500" />;
    case "skill":   return <Trophy   className="h-5 w-5 text-emerald-600" />;
    case "weekly":  return <TrendingUp className="h-5 w-5 text-purple-600" />;
    default:        return <Bell     className="h-5 w-5 text-slate-600" />;
  }
};

const getIconBg = (type: NotificationType) => {
  switch (type) {
    case "goal":   return "bg-blue-50 border-blue-100";
    case "streak": return "bg-orange-50 border-orange-100";
    case "skill":  return "bg-emerald-50 border-emerald-100";
    case "weekly": return "bg-purple-50 border-purple-100";
    default:       return "bg-slate-50 border-slate-100";
  }
};

// ─── PreferencesPanel ─────────────────────────────────────────────────────────

const PreferencesPanel = ({ onClose }: { onClose: () => void }) => {
  const { preferences, updatingPreferences, loadingPreferences, updatePrefs } =
    useNotificationsStore();

  const togglePref = (key: keyof NonNullable<typeof preferences>) => {
    if (!preferences) return;
    updatePrefs({ [key]: !preferences[key] });
  };

  const prefItems = [
    { key: "goal_deadline" as const,  label: "Goal Deadlines",  description: "Alerts when a goal is due soon" },
    { key: "streak_broken" as const,  label: "Streak Alerts",   description: "Notify when your streak is broken" },
    { key: "skill_levelup" as const,  label: "Skill Level-Ups", description: "Celebrate when you reach a new level" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      className="absolute right-0 top-12 z-30 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800">Notification Preferences</h3>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
          <X className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {loadingPreferences ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {prefItems.map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{description}</p>
              </div>
              <button
                disabled={updatingPreferences}
                onClick={() => togglePref(key)}
                className={`relative shrink-0 h-5 w-9 rounded-full transition-colors duration-200 ${
                  preferences?.[key] ? "bg-indigo-500" : "bg-slate-200"
                } ${updatingPreferences ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    preferences?.[key] ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="p-5 flex gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 mt-1" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-4 bg-slate-100 rounded w-1/3" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
  </div>
);

// ─── Notifications Page ───────────────────────────────────────────────────────

export const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    markingAllRead,
    error,
    loadNotifications,
    loadPreferences,
    markAllRead,
    markOneRead,
    clearError,
  } = useNotificationsStore();

  const [activeTab, setActiveTab]   = useState<"all" | "unread">("all");
  const [showPrefs, setShowPrefs]   = useState(false);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  const filtered =
    activeTab === "all" ? notifications : notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">

        {/* ── Workspace ──────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-3xl mx-auto">

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button onClick={clearError} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeTab === "all"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab("unread")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    activeTab === "unread"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Unread
                  {unreadCount > 0 && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 relative">
                <button
                  onClick={markAllRead}
                  disabled={markingAllRead || unreadCount === 0}
                  className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {markingAllRead
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <CheckCircle2 className="h-4 w-4" />}
                  Mark all as read
                </button>

                <div className="pl-3 border-l border-slate-200 relative">
                  <button
                    onClick={() => setShowPrefs((v) => !v)}
                    className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                  >
                    <SettingsIcon className="h-4 w-4" /> Notification Preferences
                  </button>
                  <AnimatePresence>
                    {showPrefs && <PreferencesPanel onClose={() => setShowPrefs(false)} />}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Notifications list card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">

                {/* Loading skeletons */}
                {loadingNotifications && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}

                {/* Notification rows */}
                {!loadingNotifications && (
                  <AnimatePresence>
                    {filtered.map((notification) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        key={notification.id}
                        className={`p-5 flex gap-4 transition-colors relative group ${
                          notification.read ? "bg-white" : "bg-indigo-50/30"
                        }`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full" />
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-1 ${getIconBg(notification.type)}`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1">
                            <h4 className={`text-base font-semibold ${notification.read ? "text-slate-700" : "text-slate-900"}`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                              {notification.time}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mb-3">
                            {notification.description}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => markOneRead(notification.id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Empty state */}
                {!loadingNotifications && filtered.length === 0 && (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <Mail className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-lg font-medium text-slate-600">You're all caught up!</p>
                    <p className="text-sm mt-1">
                      No {activeTab === "unread" ? "unread " : ""}notifications right now.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};