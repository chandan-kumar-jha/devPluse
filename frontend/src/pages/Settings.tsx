import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Moon, Sun, Download, Database, AlertTriangle,
  Lock, Mail,  CheckCircle2, Loader2,
} from "lucide-react";
import { settingsApi } from "../api/settings.api";
import type { PrivacySettings } from "../types/settings.types";

// ── Helper: download a file in browser ────────────────────────
const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  console.log("helllo")
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const Settings = () => {

  // ── Theme (local only — no backend) ───────────────────────
  const [theme, setTheme] = useState("light");

  // ── Email prefs (local only — no backend endpoint) ────────
  const [emails, setEmails] = useState({
    deadline: true,
    streak: true,
    weekly: false,
  });

  // ── Privacy Settings ───────────────────────────────────────
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    hideStats: false,
  });
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacySaved, setPrivacySaved] = useState(false);

  // ── Export state ───────────────────────────────────────────
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  // ── Fetch privacy on mount ─────────────────────────────────
  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const data = await settingsApi.getPrivacy();
        setPrivacy(data);
      } catch (err) {
        console.error("Privacy fetch failed:", err);
      }
    };
    fetchPrivacy();
  }, []);

  // ── Save privacy ───────────────────────────────────────────
  const handleSavePrivacy = async () => {
    try {
      setPrivacyLoading(true);
      const updated = await settingsApi.updatePrivacy(privacy);
      setPrivacy(updated);
      setPrivacySaved(true);
      setTimeout(() => setPrivacySaved(false), 2500);
    } catch (err) {
      console.error("Privacy update failed:", err);
    } finally {
      setPrivacyLoading(false);
    }
  };

  // ── Export JSON ────────────────────────────────────────────
  const handleExportJson = async () => {
    try {
      setExportingJson(true);
      const data = await settingsApi.exportJson();
      downloadFile(
        JSON.stringify(data, null, 2),
        `devpulse-export-${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
      );
    } catch (err) {
      console.error("JSON export failed:", err);
    } finally {
      setExportingJson(false);
    }
  };

  // ── Export CSV ─────────────────────────────────────────────
  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      const csv = await settingsApi.exportCsv();
      downloadFile(
        csv,
        `devpulse-export-${new Date().toISOString().split("T")[0]}.csv`,
        "text/csv"
      );
    } catch (err) {
      console.error("CSV export failed:", err);
    } finally {
      setExportingCsv(false);
    }
  };

  // ── Toggle helper ──────────────────────────────────────────
  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-indigo-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  // ── JSX ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      <main className="flex flex-col min-w-0 bg-slate-50/50 h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 z-10 shrink-0">
          <h1 className="text-lg font-semibold text-slate-800">Account Settings</h1>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* ── Appearance ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  {theme === "light"
                    ? <Sun className="h-5 w-5 text-indigo-500" />
                    : <Moon className="h-5 w-5 text-indigo-500" />}
                  Appearance
                </h2>
                <p className="text-sm text-slate-500 mt-1">Dark / light mode preferences.</p>
              </div>
              <div className="p-6">
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === "light"
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    <Sun className="h-8 w-8" />
                    <span className="font-semibold">Light Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                      theme === "dark"
                        ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-indigo-300"
                    }`}
                  >
                    <Moon className="h-8 w-8" />
                    <span className="font-semibold">Dark Mode</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Notification Preferences ─────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-500" /> Notification Settings
                </h2>
                <p className="text-sm text-slate-500 mt-1">Manage what we email you about.</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: "deadline", label: "Goal deadline reminder", desc: "Get notified 3 days before a goal deadline." },
                  { key: "streak", label: "Streak broken alert", desc: "Get an alert if your daily streak is about to end." },
                  { key: "weekly", label: "Weekly progress summary", desc: "A recap of your sessions and XP earned." },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={(emails as any)[item.key]}
                      onChange={() =>
                        setEmails((e) => ({ ...e, [item.key]: !(e as any)[item.key] }))
                      }
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* ── Privacy Settings ─────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-500" /> Privacy Settings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Control who can see your profile.</p>
                </div>
                <div className="p-6 space-y-5">

                  {/* Profile Visibility */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Profile visibility</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Currently: <span className="font-medium text-indigo-600 capitalize">{privacy.profileVisibility}</span>
                      </p>
                    </div>
                    <Toggle
                      checked={privacy.profileVisibility === "public"}
                      onChange={() =>
                        setPrivacy((p) => ({
                          ...p,
                          profileVisibility:
                            p.profileVisibility === "public" ? "private" : "public",
                        }))
                      }
                    />
                  </div>

                  {/* Hide Stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Hide stats</p>
                      <p className="text-xs text-slate-500 mt-0.5">Hide XP and level from public view</p>
                    </div>
                    <Toggle
                      checked={privacy.hideStats}
                      onChange={() =>
                        setPrivacy((p) => ({ ...p, hideStats: !p.hideStats }))
                      }
                    />
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSavePrivacy}
                    disabled={privacyLoading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    {privacyLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : privacySaved ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : null}
                    {privacyLoading ? "Saving..." : privacySaved ? "Saved!" : "Save Privacy Settings"}
                  </button>
                </div>
              </motion.div>

              {/* ── Export Data ───────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-500" /> Export Your Data
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Download all your sessions, goals, and skills.</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-500 mb-6">
                    Your data is yours. Export anytime in JSON or CSV format.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleExportCsv}
                      disabled={exportingCsv}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      {exportingCsv
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4" />}
                      {exportingCsv ? "Exporting..." : "CSV"}
                    </button>
                    <button
                      onClick={handleExportJson}
                      disabled={exportingJson}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-800 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      {exportingJson
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Database className="h-4 w-4" />}
                      {exportingJson ? "Exporting..." : "JSON"}
                    </button>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* ── Danger Zone ──────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-red-200/60">
                <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Danger Zone
                </h2>
                <p className="text-sm text-red-500 mt-1">Irreversible actions — proceed with caution.</p>
              </div>
              <div className="p-6">
                <p className="text-sm text-red-600 mb-6">
                  Once you delete your account, all your data will be permanently removed. This cannot be undone.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you absolutely sure? This will permanently delete your account and all data.")) {
                      // DELETE /auth/account — implement when needed
                      alert("Account deletion coming soon.");
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  Permanently Delete Account
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
};