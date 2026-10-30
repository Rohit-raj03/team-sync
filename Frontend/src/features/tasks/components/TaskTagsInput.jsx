import React, { useState, useMemo } from "react";
import { Tag, Plus, X, Hash } from "lucide-react";
import {
  deriveProjectColorTokens,
  DEFAULT_PROJECT_COLOR,
} from "../../timeline/utils/timelineColors.js";
import { useProjects } from "../../projects/hooks/useProjects.js";

const SUGGESTED_TAGS = [
  "Frontend",
  "Backend",
  "UI/UX",
  "API",
  "Bug",
  "Design System",
  "DevOps",
];

/**
 * Feature Component: TaskTagsInput
 * Layer: features/tasks/components/
 * Responsibility: Tag selection, custom tag creation, and distinct tag chip display inheriting project theme color.
 */
export const TaskTagsInput = ({
  tags = [],
  onChange,
  projectColor: explicitColor,
  projectId,
}) => {
  const { allProjects } = useProjects();
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Dynamically resolve the project theme color
  const resolvedColor = useMemo(() => {
    if (explicitColor) return explicitColor;
    if (projectId && Array.isArray(allProjects)) {
      const match = allProjects.find(
        (p) =>
          (p.id || p._id) === projectId ||
          String(p._id) === String(projectId)
      );
      if (match?.themeColor) return match.themeColor;
      if (match?.color) return match.color;
    }
    return DEFAULT_PROJECT_COLOR;
  }, [explicitColor, projectId, allProjects]);

  const tokens = useMemo(
    () => deriveProjectColorTokens(resolvedColor),
    [resolvedColor]
  );

  const handleAddTag = (tagToAdd) => {
    let cleaned = tagToAdd.trim();
    if (cleaned.startsWith("#")) cleaned = cleaned.slice(1).trim();
    if (!cleaned) return;
    if (!tags.includes(cleaned)) {
      onChange([...tags, cleaned]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag(inputValue);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Tag size={14} style={{ color: tokens.primary }} />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tags & Labels
          </label>
        </div>
        <span
          className="text-[10px] font-bold uppercase border px-2 py-0.5 rounded-full shadow-2xs transition-colors"
          style={{
            color: tokens.badgeText,
            backgroundColor: tokens.bgLight,
            borderColor: tokens.border,
          }}
        >
          #Metadata
        </span>
      </div>

      {/* Selected Tags Chips */}
      {tags.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5 p-2 rounded-xl border transition-colors"
          style={{
            backgroundColor: tokens.bgSubtle,
            borderColor: tokens.border,
          }}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all hover:brightness-95"
              style={{
                backgroundColor: tokens.bgLight,
                color: tokens.badgeText,
                borderColor: tokens.border,
              }}
            >
              <Hash size={11} style={{ color: tokens.primary }} />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ml-0.5 cursor-pointer hover:bg-black/10"
                style={{ color: tokens.primary }}
                aria-label={`Remove tag ${tag}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Hash
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
            style={{ color: isFocused ? tokens.primary : "#94a3b8" }}
          />
          <input
            type="text"
            placeholder="Add tag (e.g. Frontend, Sprint-1) and press Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-7 pr-3 py-1.5 rounded-xl border text-xs bg-white placeholder-slate-400 text-slate-800 transition-all outline-hidden"
            style={{
              borderColor: isFocused ? tokens.primary : "#e2e8f0",
              boxShadow: isFocused ? `0 0 0 3px ${tokens.bgLight}` : "none",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim()}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-2xs hover:brightness-105 active:scale-98"
          style={{
            backgroundColor: tokens.primary,
            color: tokens.textColor,
          }}
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-slate-400">
          Suggested tags:
        </span>
        {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
          .slice(0, 5)
          .map((suggested) => (
            <button
              key={suggested}
              type="button"
              onClick={() => handleAddTag(suggested)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.bgLight;
                e.currentTarget.style.color = tokens.primary;
                e.currentTarget.style.borderColor = tokens.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "";
                e.currentTarget.style.color = "";
                e.currentTarget.style.borderColor = "";
              }}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60 transition-colors cursor-pointer"
            >
              #{suggested}
            </button>
          ))}
      </div>
    </div>
  );
};

export default TaskTagsInput;
