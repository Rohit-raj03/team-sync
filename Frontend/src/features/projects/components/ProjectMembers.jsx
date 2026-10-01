import React, { useState } from "react";
import { Users, UserPlus, X, Shield, Mail, Check } from "lucide-react";
import { ProjectMemberTagSelector } from "./ProjectMemberTagSelector.jsx";

/**
 * Feature Component: ProjectMembers
 * Layer: features/projects/components/
 * Responsibility: Displays all tagged team members for a specific project, their project roles, and quick tag/untag operations.
 */
export const ProjectMembers = ({
  projectId,
  members = [],
  onTagMember,
  onUntagMember,
}) => {
  const [isManageOpen, setIsManageOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
            <Users size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Tagged Project Members ({members.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Team members allocated to this project and its connected tasks.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsManageOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4361EE] text-xs font-bold transition-colors"
        >
          <UserPlus size={14} />
          <span>{isManageOpen ? "Close Tagger" : "Manage Members"}</span>
        </button>
      </div>

      {/* Inline Manage Member Tagger if open */}
      {isManageOpen && (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xs animate-in fade-in duration-150">
          <ProjectMemberTagSelector
            taggedMembers={members}
            onChange={(newMembers) => {
              // Synchronize with parent/store
              newMembers.forEach((m) => {
                if (!members.some((existing) => existing.id === m.id)) {
                  onTagMember?.(m, m.projectRole);
                }
              });
              members.forEach((existing) => {
                if (!newMembers.some((m) => m.id === existing.id)) {
                  onUntagMember?.(existing.id);
                }
              });
            }}
          />
        </div>
      )}

      {/* Tagged Members Cards Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-3.5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {member.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {member.role || "Contributor"}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-50 text-[#4361EE]">
                    {member.projectRole || "Contributor"}
                  </span>
                </div>
              </div>

              {onUntagMember && (
                <button
                  type="button"
                  onClick={() => onUntagMember(member.id)}
                  title={`Remove ${member.name} from project`}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            No team members tagged to this project yet.
          </p>
          <button
            type="button"
            onClick={() => setIsManageOpen(true)}
            className="mt-2 text-xs font-bold text-[#4361EE] hover:underline"
          >
            + Tag team members now
          </button>
        </div>
      )}
    </div>
  );
};
