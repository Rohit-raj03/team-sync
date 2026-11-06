import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  X,
  ShieldCheck,
  Mail,
  Check,
  Search,
  Crown,
  Eye,
  UserCheck,
  Loader2,
  ChevronDown,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { projectService } from "../services/project.service.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";

const ACCESS_ROLES = ["Admin", "Member", "Viewer"];

const SPECIALTY_ROLES = [
  "Project Lead",
  "Frontend Contributor",
  "Backend Contributor",
  "Full Stack Contributor",
  "UI/UX Designer",
  "QA Reviewer",
  "DevOps Engineer",
  "Contributor",
];

const ROLE_BADGES = {
  Owner: {
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    icon: Crown,
    label: "Project Owner",
  },
  Admin: {
    bg: "bg-indigo-50 text-[#4361EE] border-indigo-200",
    icon: ShieldCheck,
    label: "Admin",
  },
  Member: {
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: UserCheck,
    label: "Member",
  },
  Viewer: {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Eye,
    label: "Viewer",
  },
};

/**
 * Feature Component: ProjectMembers
 * Layer: features/projects/components/
 * Responsibility: Full team member management for a project:
 * - List existing members with roles and avatars
 * - Search existing members
 * - Add eligible registered users with duplicate protection
 * - Assign and update roles (Owner, Admin, Member, Viewer)
 * - Remove members with permission validation and owner protection
 */
export const ProjectMembers = ({
  projectId,
  members = [],
  onTagMember,
  onUntagMember,
  onUpdateMemberRole,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editRole, setEditRole] = useState("Member");
  const [editProjectRole, setEditProjectRole] = useState("Contributor");

  // Add Member State
  const [eligibleSearch, setEligibleSearch] = useState("");
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState(null);
  const [newMemberRole, setNewMemberRole] = useState("Member");
  const [newMemberProjectRole, setNewMemberProjectRole] =
    useState("Contributor");
  const [addError, setAddError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter existing members
  const filteredExistingMembers = useMemo(() => {
    const q = memberSearchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.username || "").toLowerCase().includes(q) ||
        (m.role || "").toLowerCase().includes(q) ||
        (m.projectRole || "").toLowerCase().includes(q),
    );
  }, [members, memberSearchQuery]);

  // Fetch eligible users when Add Member modal is opened or search changes
  useEffect(() => {
    if (!isAddModalOpen || !projectId) return;

    let isMounted = true;
    const fetchEligible = async () => {
      setLoadingEligible(true);
      try {
        const res = await projectService.getEligibleMembers(
          projectId,
          eligibleSearch.trim(),
        );
        if (isMounted) {
          const list = res?.users || res?.data || [];
          setEligibleUsers(list);
        }
      } catch (err) {
        if (isMounted) {
          setEligibleUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoadingEligible(false);
        }
      }
    };

    const timer = setTimeout(fetchEligible, 250);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isAddModalOpen, projectId, eligibleSearch]);

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserToAdd) {
      setAddError("Please select a user to add.");
      return;
    }

    setIsSubmitting(true);
    setAddError("");
    try {
      if (onTagMember) {
        await onTagMember(
          selectedUserToAdd,
          newMemberProjectRole,
          newMemberRole,
        );
      }
      setSelectedUserToAdd(null);
      setIsAddModalOpen(false);
    } catch (err) {
      setAddError(err?.message || "Failed to add member to project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditMember = (member) => {
    setEditingMemberId(member.id);
    setEditRole(member.role || "Member");
    setEditProjectRole(member.projectRole || "Contributor");
  };

  const handleSaveMemberRole = async (memberId) => {
    if (onUpdateMemberRole) {
      await onUpdateMemberRole(memberId, editRole, editProjectRole);
    }
    setEditingMemberId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-[#4361EE] flex items-center justify-center shadow-xs">
            <Users size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Project Team ({members.length})
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {
                  members.filter(
                    (m) => m.role === "Admin" || m.role === "Owner",
                  ).length
                }{" "}
                Leads
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Manage team members, assign access privileges, and allocate
              project responsibilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Member Search input */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search members..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAddModalOpen(true);
              setAddError("");
              setSelectedUserToAdd(null);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-xs transition-all"
          >
            <UserPlus size={14} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Add Member Modal / Drawer Overlay */}
      {isAddModalOpen && (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm animate-in fade-in duration-150 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-[#4361EE]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Add Registered User to Project
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {addError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-500" />
              <span>{addError}</span>
            </div>
          )}

          {/* Search Eligible Users */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Find User by Name or Email
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Type name, email, or username to search non-members..."
                value={eligibleSearch}
                onChange={(e) => setEligibleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
              />
            </div>
          </div>

          {/* User Results Selector */}
          <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {loadingEligible ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#4361EE]" />
                <span>Searching eligible registered users...</span>
              </div>
            ) : eligibleUsers.length > 0 ? (
              eligibleUsers.map((user) => {
                const isSelected =
                  selectedUserToAdd?.id === (user.id || user._id);
                return (
                  <div
                    key={user.id || user._id}
                    onClick={() =>
                      setSelectedUserToAdd({
                        id: user.id || user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        avatar: user.avatar,
                        role: user.role,
                      })
                    }
                    className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-indigo-50/80 border-l-4 border-[#4361EE]"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar
                        src={user.avatar}
                        name={user.name}
                        size="sm"
                        className="ring-1 ring-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {user.jobTitle || user.role || "User"}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#4361EE] text-white flex items-center justify-center">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#4361EE]">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                {eligibleSearch
                  ? `No eligible users found matching "${eligibleSearch}".`
                  : "All registered users are already in this project or none found."}
              </div>
            )}
          </div>

          {/* Role Configuration for the selected user */}
          {selectedUserToAdd && (
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span>Configure Role for</span>
                <span className="text-[#4361EE]">{selectedUserToAdd.name}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Project Access Level
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-[#4361EE]"
                  >
                    {ACCESS_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Project Responsibility / Specialty
                  </label>
                  <select
                    value={newMemberProjectRole}
                    onChange={(e) => setNewMemberProjectRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-[#4361EE]"
                  >
                    {SPECIALTY_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddMemberSubmit}
              disabled={!selectedUserToAdd || isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-98 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Add to Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Members Cards Grid */}
      {filteredExistingMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredExistingMembers.map((member) => {
            const roleInfo = ROLE_BADGES[member.role] || ROLE_BADGES.Member;
            const Icon = roleInfo.icon;
            const isOwner = member.role === "Owner";
            const isEditing = editingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xs transition-all flex flex-col justify-between gap-3 group relative"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="md"
                        className="ring-2 ring-slate-100"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {member.email ||
                          (member.username ? `@${member.username}` : "Member")}
                      </p>
                    </div>
                  </div>

                  {/* Access Role Badge */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}
                    >
                      <Icon size={11} />
                      <span>{member.role || "Member"}</span>
                    </span>
                  </div>
                </div>

                {/* Inline Role Editing View */}
                {isEditing ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2 animate-in fade-in duration-150">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                          Access Role
                        </label>
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-[#4361EE]"
                        >
                          {ACCESS_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                          Project Role
                        </label>
                        <select
                          value={editProjectRole}
                          onChange={(e) => setEditProjectRole(e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold focus:ring-1 focus:ring-[#4361EE]"
                        >
                          {SPECIALTY_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingMemberId(null)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveMemberRole(member.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#4361EE] text-white text-[10px] font-bold shadow-xs hover:bg-[#3451DE] transition-colors"
                      >
                        Save Role
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Normal View: Project Role + Actions */
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-semibold text-slate-500">
                      {member.projectRole || "Contributor"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isOwner && onUpdateMemberRole && (
                        <button
                          type="button"
                          onClick={() => startEditMember(member)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-[#4361EE] hover:bg-indigo-50 transition-colors"
                        >
                          Change Role
                        </button>
                      )}

                      {!isOwner && onUntagMember && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove ${member.name} from this project? They will also be removed from assigned tasks.`,
                              )
                            ) {
                              onUntagMember(member.id);
                            }
                          }}
                          title={`Remove ${member.name} from project`}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}

                      {isOwner && (
                        <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
          <p className="text-xs font-medium text-slate-500">
            {memberSearchQuery
              ? `No members found matching "${memberSearchQuery}".`
              : "No team members tagged to this project yet."}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 text-xs font-bold text-[#4361EE] hover:underline"
          >
            + Add registered team members now
          </button>
        </div>
      )}
    </div>
  );
};
