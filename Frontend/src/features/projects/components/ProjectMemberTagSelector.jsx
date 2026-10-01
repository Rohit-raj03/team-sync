import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Check,
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useTeam } from "../../team/hooks/useTeam.js";

const PROJECT_ROLES = [
  "Project Lead",
  "Frontend Contributor",
  "Backend Contributor",
  "UI/UX Designer",
  "QA Reviewer",
  "Contributor",
];

/**
 * Feature Component: ProjectMemberTagSelector
 * Layer: features/projects/components/
 * Responsibility: Tag team members to a project, specify project roles, multi-select with search, and manage tagged chips.
 */
export const ProjectMemberTagSelector = ({
  taggedMembers = [],
  onChange,
  error,
}) => {
  const { members } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("Contributor");

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.username && m.username.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q)),
    );
  }, [members, searchQuery]);

  const isTagged = (memberId) => {
    return taggedMembers.some((m) => m.id === memberId);
  };

  const handleToggleMember = (member) => {
    if (isTagged(member.id)) {
      onChange(taggedMembers.filter((m) => m.id !== member.id));
    } else {
      onChange([
        ...taggedMembers,
        {
          ...member,
          projectRole: selectedRole,
        },
      ]);
    }
  };

  const handleRemoveMember = (memberId, e) => {
    e?.stopPropagation();
    onChange(taggedMembers.filter((m) => m.id !== memberId));
  };

  const handleRoleChangeForMember = (memberId, newRole) => {
    onChange(
      taggedMembers.map((m) =>
        m.id === memberId ? { ...m, projectRole: newRole } : m,
      ),
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Tag Project Members{" "}
          <span className="text-slate-400 font-normal">
            ({taggedMembers.length} tagged)
          </span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          People who can contribute to this project
        </span>
      </div>

      {/* Tagged Members Chips Bar */}
      {taggedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50/90 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">
            Tagged:
          </span>
          {taggedMembers.map((member) => (
            <div
              key={member.id}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white border border-slate-200/90 shadow-xs text-xs font-medium text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            >
              <img
                src={member.avatar}
                alt={member.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-100"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                }}
              />
              <span className="text-xs font-semibold text-slate-700">
                {member.name}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-[#4361EE]">
                {member.projectRole || "Contributor"}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemoveMember(member.id, e)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors ml-0.5"
                aria-label={`Remove ${member.name} from project`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar + Default Role Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
        <div className="sm:col-span-8 relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members by name or role to tag..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            title="Default role for newly tagged member"
          >
            {PROJECT_ROLES.map((role) => (
              <option key={role} value={role}>
                Role: {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Member Selection List */}
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const active = isTagged(member.id);
              const taggedInfo = taggedMembers.find((m) => m.id === member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member)}
                  className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                    active
                      ? "bg-indigo-50/50 hover:bg-indigo-50/80"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        active
                          ? "bg-[#4361EE] border-[#4361EE] text-white shadow-xs"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </div>

                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100 shrink-0"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                      }}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {member.name}
                        </p>
                        {member.username && (
                          <span className="text-[10px] text-slate-400">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {member.role || "Contributor"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {active ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <UserCheck size={11} />
                        <span>
                          Tagged ({taggedInfo?.projectRole || "Member"})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 hover:text-[#4361EE]">
                        + Tag
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400">
              No team members found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
