import React, { useState } from "react";
import { Tag, Plus, X } from "lucide-react";

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
 * Responsibility: Tag selection, custom tag creation, and tag chip display.
 */
export const TaskTagsInput = ({ tags = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (tagToAdd) => {
    const cleaned = tagToAdd.trim();
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
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Tag size={14} className="text-slate-500" />
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Tags
        </label>
      </div>

      {/* Selected Tags Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-[#4361EE] border border-indigo-100"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
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
        <input
          type="text"
          placeholder="Add tags (press Enter or comma)..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
        />
        <button
          type="button"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim()}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-[#4361EE] text-slate-700 text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1"
        >
          <Plus size={13} />
          <span>Add</span>
        </button>
      </div>

      {/* Suggested Quick Tags */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-semibold text-slate-400">
          Suggestions:
        </span>
        {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
          .slice(0, 4)
          .map((suggested) => (
            <button
              key={suggested}
              type="button"
              onClick={() => handleAddTag(suggested)}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              +{suggested}
            </button>
          ))}
      </div>
    </div>
  );
};
