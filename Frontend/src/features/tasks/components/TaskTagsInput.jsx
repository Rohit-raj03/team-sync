import React, { useState } from "react";
import { Tag, Plus, X, Hash } from "lucide-react";

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
 * Responsibility: Tag selection, custom tag creation, and distinct tag chip display.
 */
export const TaskTagsInput = ({ tags = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

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
          <Tag size={14} className="text-amber-500" />
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Tags & Labels
          </label>
        </div>
        <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
          #Metadata
        </span>
      </div>

      {/* Selected Tags Chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-2 bg-amber-50/30 rounded-xl border border-amber-100/60">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100/70 text-amber-900 border border-amber-200 shadow-2xs transition-all hover:bg-amber-100"
            >
              <Hash size={11} className="text-amber-600" />
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-amber-500 hover:text-amber-900 hover:bg-amber-200/60 transition-colors ml-0.5 cursor-pointer"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Add tag (e.g. Frontend, Sprint-1) and press Enter..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-7 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddTag(inputValue)}
          disabled={!inputValue.trim()}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer shadow-2xs"
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
              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 border border-slate-200/60 transition-colors cursor-pointer"
            >
              #{suggested}
            </button>
          ))}
      </div>
    </div>
  );
};

export default TaskTagsInput;
