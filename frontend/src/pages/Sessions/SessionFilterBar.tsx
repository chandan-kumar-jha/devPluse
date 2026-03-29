import React from "react";
import { Search, Filter } from "lucide-react";

// Inhe bahar rakho taaki render pe re-initialize na ho
const STATIC_TAGS = [
  "Architecture", "Backend", "Database", "Frontend", 
  "Learning", "PostgreSQL", "React", "Security"
];

type SessionFilterBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTagsFilter: string[];
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
};

export const SessionFilterBar = ({
  searchQuery,
  onSearchChange,
  selectedTagsFilter = [], // Default to empty array
  onTagToggle,
  onClearTags,
}: SessionFilterBarProps) => {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-6">
      
      {/* ── 1. Search Bar (Full Width) ────────────────────────────── */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search sessions by title or notes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-600 placeholder:text-slate-400"
        />
      </div>

      {/* ── 2. Tag Row (Horizontal) ────────────────────────── */}
      {/* Humne condition hata di hai taaki tags hamesha render hon */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-1">
        
        {/* Label matching Image 1 */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
            Filter by Tags:
          </span>
        </div>

        {/* Pill Tags - Using STATIC_TAGS directly */}
        <div className="flex flex-wrap items-center gap-2">
          {STATIC_TAGS.map((tag) => {
            const isActive = selectedTagsFilter.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {tag}
              </button>
            );
          })}

          {/* Reset Action */}
          {selectedTagsFilter.length > 0 && (
            <button
              type="button"
              onClick={onClearTags}
              className="ml-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest underline underline-offset-4 decoration-2"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};