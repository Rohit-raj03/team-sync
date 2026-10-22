import React, { useState } from "react";
import {
  FolderKanban,
  Calendar,
  AlertCircle,
  Check,
  Tag,
  Palette,
  Layers,
  Clock,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";
import { ProjectMemberTagSelector } from "./ProjectMemberTagSelector.jsx";

const PROJECT_CATEGORIES = [
  "Web Application",
  "Mobile Application",
  "Design System",
  "Cloud & DevOps",
  "Internal Tooling",
  "Marketing & Brand",
];

const COLOR_PALETTES = [
  { value: "#4361EE", label: "Royal Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Rose" },
];

/**
 * Feature Component: ProjectForm
 * Layer: features/projects/components/
 * Responsibility: Complete project creation and edit form with member tagging, schedule configuration, category classification, and validation.
 */
export const ProjectForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    category: initialData.category || "Web Application",
    status: initialData.status || "ACTIVE",
    priority: initialData.priority || "MEDIUM",
    color: initialData.color || "#4361EE",
    startDate: initialData.startDate || new Date().toISOString().split("T")[0],
    dueDate:
      initialData.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    members: initialData.members || [],
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Project name is required.";
    } else if (formData.name.trim().length < 3) {
      errs.name = "Project name must be at least 3 characters.";
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        errs.dueDate = "Due date cannot precede the start date.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Global Validation Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <AlertCircle size={15} className="text-rose-500 shrink-0" />
          <span>Please address the errors highlighted below.</span>
        </div>
      )}

      {/* Top Details: Name, Category, Theme Color */}
      <div className="space-y-3">
        {/* Project Name */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Next-Gen Client Portal"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: null });
            }}
            className={`w-full px-3.5 py-2 rounded-2xl border text-sm font-semibold transition-all ${
              errors.name
                ? "border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200"
                : "border-slate-200 bg-white focus:ring-2 focus:ring-[#4361EE] focus:border-transparent"
            } text-slate-900 placeholder-slate-400 shadow-2xs`}
          />
          {errors.name && (
            <p className="text-xs text-rose-500 font-medium">{errors.name}</p>
          )}
        </div>

        {/* Category & Accent Color */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {/* Category Input Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type category or select a tag below..."
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE] focus:border-transparent shadow-2xs"
                />
                <Tag
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                {formData.category && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, category: "" })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                    title="Clear category"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Theme Color */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Theme Color
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PALETTES.map((palette) => (
                  <button
                    type="button"
                    key={palette.value}
                    onClick={() =>
                      setFormData({ ...formData, color: palette.value })
                    }
                    style={{ backgroundColor: palette.value }}
                    title={palette.label}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-transform flex items-center justify-center text-white cursor-pointer ${
                      formData.color === palette.value
                        ? "scale-115 ring-2 ring-offset-2 ring-slate-400 shadow-2xs"
                        : "hover:scale-105 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {formData.color === palette.value && (
                      <Check size={13} strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Clickable Preset Category Tags */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">
              Popular Category Tags:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_CATEGORIES.map((cat) => {
                const isSelected =
                  formData.category?.trim().toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        category: isSelected ? "" : cat,
                      })
                    }
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#4361EE] text-white shadow-xs border border-[#4361EE]"
                        : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/70"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check size={12} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Description & Key Objectives
          </label>
          <textarea
            rows={2}
            placeholder="Outline the core goals, deliverable scope, and technical roadmap for this project..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE] shadow-2xs resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Status, Priority & Dates */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-100/90 space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-[#4361EE]"
            >
              <option value="PLANNING">Planning</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-[#4361EE]"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-[#4361EE]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Target Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => {
                setFormData({ ...formData, dueDate: e.target.value });
                if (errors.dueDate) setErrors({ ...errors, dueDate: null });
              }}
              className={`w-full px-2 py-1.5 rounded-xl border text-xs bg-white text-slate-800 focus:ring-2 ${
                errors.dueDate
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-[#4361EE]"
              }`}
            />
          </div>
        </div>
        {errors.dueDate && (
          <p className="text-[11px] text-rose-500 font-medium">
            {errors.dueDate}
          </p>
        )}
      </div>

      {/* MEMBER TAGGING SECTION: Tag Who Is in This Project with Role */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <ProjectMemberTagSelector
          taggedMembers={formData.members}
          onChange={(newMembers) =>
            setFormData({ ...formData, members: newMembers })
          }
        />
      </div>

      {/* Sticky Bottom Form Action Controls (Always Visible & Accessible on Screen) */}
      <div className="sticky -bottom-4 sm:-bottom-6 bg-white/95 backdrop-blur-md pt-3 pb-2 border-t border-slate-100 flex items-center justify-end gap-3 -mx-4 sm:-mx-6 px-4 sm:px-6 z-10 shadow-2xs mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving Project...</span>
            </>
          ) : (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>
                {initialData.id || initialData._id
                  ? "Update Project"
                  : "Create Project"}
              </span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
