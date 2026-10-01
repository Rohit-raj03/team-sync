import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  UserPlus,
  Check,
  Users,
  Mail,
  Briefcase,
  Plus,
} from "lucide-react";
import { useTeam } from "../../team/hooks/useTeam.js";

/**
 * Feature Component: TaskAssigneeSelector
 * Layer: features/tasks/components/
 * Responsibility: Multi-select team member assignees with real-time search, dynamic roles, selected chips, and quick member invite capability.
 */
export const TaskAssigneeSelector = ({
  selectedAssignees = [],
  onChange,
  error,
}) => {
  const { members, inviteMember } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newMemberData, setNewMemberData] = useState({
    name: "",
    email: "",
    role: "",
    username: "",
  });
  const [inviteError, setInviteError] = useState("");

  // Filter members based on search query (name or username)
  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.username && m.username.toLowerCase().includes(query)) ||
        (m.role && m.role.toLowerCase().includes(query)),
    );
  }, [members, searchQuery]);

  const isSelected = (memberId) => {
    return selectedAssignees.some((a) => a.id === memberId);
  };

  const handleToggleMember = (member) => {
    if (isSelected(member.id)) {
      onChange(selectedAssignees.filter((a) => a.id !== member.id));
    } else {
      onChange([...selectedAssignees, member]);
    }
  };

  const handleRemoveMember = (memberId, e) => {
    e?.stopPropagation();
    onChange(selectedAssignees.filter((a) => a.id !== memberId));
  };

  const handleQuickInvite = (e) => {
    e.preventDefault();
    if (!newMemberData.name.trim()) {
      setInviteError("Please provide a full name");
      return;
    }

    const createdMember = inviteMember({
      name: newMemberData.name.trim(),
      email: newMemberData.email.trim(),
      role: newMemberData.role.trim() || "Software Engineer",
      username: newMemberData.username.trim(),
    });

    // Auto-select the newly created member
    onChange([...selectedAssignees, createdMember]);

    // Reset and close invite form
    setNewMemberData({ name: "", email: "", role: "", username: "" });
    setInviteError("");
    setIsInviteOpen(false);
    setSearchQuery("");
  };

  const openInviteWithName = () => {
    setNewMemberData((prev) => ({
      ...prev,
      name: searchQuery,
      username: searchQuery.toLowerCase().replace(/\s+/g, ""),
    }));
    setIsInviteOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Assignees{" "}
          <span className="text-slate-400 font-normal">
            ({selectedAssignees.length} selected)
          </span>
        </label>
        <button
          type="button"
          onClick={() => setIsInviteOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4361EE] hover:text-[#3451DE] transition-colors"
        >
          <UserPlus size={14} />
          <span>Invite New</span>
        </button>
      </div>

      {/* Selected Users Chips */}
      {selectedAssignees.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">
            Selected:
          </span>
          {selectedAssignees.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-medium text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-100"
                onError={(e) => {
                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
                }}
              />
              <span className="text-xs font-semibold text-slate-700">
                {user.name}
              </span>
              <button
                type="button"
                onClick={(e) => handleRemoveMember(user.id, e)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                aria-label={`Remove ${user.name}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members by name or username..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4361EE] focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Team Members List (Scrollable Card) */}
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const active = isSelected(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleToggleMember(member)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    active
                      ? "bg-indigo-50/50 hover:bg-indigo-50/80"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox indicator */}
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        active
                          ? "bg-[#4361EE] border-[#4361EE] text-white shadow-xs"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {active && <Check size={12} strokeWidth={3} />}
                    </div>

                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;
                        }}
                      />
                      {member.status === "online" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                      )}
                      {member.status === "in-meeting" && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                      )}
                    </div>

                    {/* Name, Username & Dynamic Role */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {member.name}
                        </p>
                        {member.username && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate font-medium">
                        {member.role || "Contributor"}
                      </p>
                    </div>
                  </div>

                  {/* Status / Role pill */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      active
                        ? "bg-indigo-100 text-[#4361EE]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {active ? "Assigned" : member.role?.split(" ")[0] || "Team"}
                  </span>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  No users found
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No team members match "{searchQuery}"
                </p>
              </div>
              <button
                type="button"
                onClick={openInviteWithName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4361EE] text-xs font-bold transition-colors"
              >
                <Plus size={14} />
                <span>Invite "{searchQuery}"</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Quick Invite New Member Modal / Drawer */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4361EE] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Invite New Team Member
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Add user to workspace and assign to task
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickInvite} className="p-6 space-y-4">
              {inviteError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 font-medium">
                  {inviteError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newMemberData.name}
                  onChange={(e) =>
                    setNewMemberData({ ...newMemberData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    placeholder="e.g. rahul@teamsync.io"
                    value={newMemberData.email}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. rahul"
                    value={newMemberData.username}
                    onChange={(e) =>
                      setNewMemberData({
                        ...newMemberData,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role / Title
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="e.g. QA Engineer"
                      value={newMemberData.role}
                      onChange={(e) =>
                        setNewMemberData({
                          ...newMemberData,
                          role: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Add & Assign</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
