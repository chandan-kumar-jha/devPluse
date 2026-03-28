/**
 * 🎯 Goal Helper Utilities
 */

// 1. Centralized Category list to keep UI and Logic in sync
export const CATEGORIES = [
  "Learning",
  "Infrastructure",
  "Career",
  "Maintenance",
  "Product",
  "General",
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

/**
 * Returns Tailwind CSS classes for category badges based on the category name.
 * Handles fallbacks for undefined or unknown categories.
 */
export const getCategoryColor = (category?: string): string => {
  const normalizedCategory = category || "General";

  switch (normalizedCategory) {
    case "Learning":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Infrastructure":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Career":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "Maintenance":
      return "bg-red-100 text-red-700 border-red-200";
    case "Product":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

/**
 * Calculates the progress percentage for a goal based on its milestones.
 */
export const calculateProgress = (milestones: { completed: boolean }[]): number => {
  if (!milestones || milestones.length === 0) return 0;
  const completedCount = milestones.filter((m) => m.completed).length;
  return Math.round((completedCount / milestones.length) * 100);
};

/**
 * Returns a color class based on the progress percentage.
 */
export const getProgressColor = (progress: number): string => {
  if (progress === 100) return "text-emerald-500";
  if (progress > 50) return "text-indigo-600";
  if (progress > 0) return "text-amber-500";
  return "text-slate-300";
};