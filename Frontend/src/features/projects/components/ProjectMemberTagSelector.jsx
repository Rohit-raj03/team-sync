import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, X, Check, Plus, ChevronDown, Trash2, Tag } from "lucide-react";
import { useTeam } from "../../team/hooks/useTeam.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";
import {
  ASSIGNED_TAGS,
  getAssignedTagStyle,
} from "../../../shared/data/assignedTags.js";

const QUICK_ROLES = Object.values(ASSIGNED_TAGS);

/**
 * Feature Component: ProjectMemberTagSelector
 * Layer: features/projects/components/
 * Responsibility: Multi-select role & tag assignment for project contributors.
 * Allows multiple simultaneous roles per member with removable chips and popover checkboxes.
 */
export const ProjectMemberTagSelector = ({
  taggedMembers = [],
  onChange,
  error,
  themeColor = "#4361EE",
}) => {
  const { members = [] } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openPopoverMemberId, setOpenPopoverMemberId] = useState(null);
  const [popoverCoords, setPopoverCoords] = useState(null);
  const [customTagInput, setCustomTagInput] = useState("");

  const searchContainerRef = useRef(null);
  const popoverRef = useRef(null);
  const triggerButtonRef = useRef(null);

  // Close search dropdown or active role popover on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setIsSearchOpen(false);
      }
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        !triggerButtonRef.current?.contains(e.target)
      ) {
        setOpenPopoverMemberId(null);
        setPopoverCoords(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reposition popover on window resize or modal scroll; preserve popover when scrolling inside it
  useEffect(() => {
    if (!openPopoverMemberId) return;

    const updatePosition = () => {
      if (!triggerButtonRef.current) return;
      const rect = triggerButtonRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        setOpenPopoverMemberId(null);
        setPopoverCoords(null);
        return;
      }
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 280;

      setPopoverCoords({
        top: openUp ? undefined : rect.bottom + 6,
        bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
        right: window.innerWidth - rect.right,
      });
    };

    const handleScroll = (e) => {
      // Allow scrolling inside the roles popover without closing or resetting
      if (popoverRef.current && popoverRef.current.contains(e.target)) {
        return;
      }
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [openPopoverMemberId]);

  const getMemberId = (member) => {
    return (
      member.id ||
      member._id ||
      member.user?._id ||
      member.user?.id ||
      (typeof member.user === "string" ? member.user : null)
    );
  };

  const isTagged = (memberId) => {
    return taggedMembers.some(
      (m) => getMemberId(m)?.toString() === memberId?.toString(),
    );
  };

  const getMemberTags = (member) => {
    if (Array.isArray(member.tags) && member.tags.length > 0) {
      return member.tags;
    }
    if (Array.isArray(member.projectRoles) && member.projectRoles.length > 0) {
      return member.projectRoles;
    }
    if (Array.isArray(member.projectRole) && member.projectRole.length > 0) {
      return member.projectRole;
    }
    if (
      typeof member.projectRole === "string" &&
      member.projectRole.includes(",")
    ) {
      return member.projectRole
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (member.projectRole) {
      return [member.projectRole];
    }
    return ["Contributor"];
  };

  const filteredSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return members.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const username = (m.username || "").toLowerCase();
      const email = (m.email || "").toLowerCase();
      const role = (m.role || m.jobTitle || "").toLowerCase();
      return (
        name.includes(q) ||
        username.includes(q) ||
        email.includes(q) ||
        role.includes(q)
      );
    });
  }, [members, searchQuery]);

  const handleAddMember = (user) => {
    const uId = user.id || user._id;
    if (isTagged(uId)) return;

    // Smart initial role tag based on member's title if matched, else Contributor
    const initialRole = (() => {
      const title = (user.role || user.jobTitle || "").toLowerCase();
      if (
        title.includes("design") ||
        title.includes("ui") ||
        title.includes("ux")
      )
        return ASSIGNED_TAGS.UI_UX || "UI/UX";
      if (title.includes("frontend"))
        return ASSIGNED_TAGS.FRONTEND || "Frontend";
      if (title.includes("backend"))
        return ASSIGNED_TAGS.BACKEND || "Backend";
      if (title.includes("full") || title.includes("stack"))
        return ASSIGNED_TAGS.FULL_STACK || "Full Stack";
      if (title.includes("qa") || title.includes("test"))
        return ASSIGNED_TAGS.QA_REVIEWER || ASSIGNED_TAGS.TESTING || "Testing";
      if (title.includes("lead") || title.includes("manager"))
        return ASSIGNED_TAGS.PROJECT_LEAD || "Project Lead";
      if (title.includes("devops") || title.includes("cloud"))
        return ASSIGNED_TAGS.DEVOPS || "DevOps";
      return ASSIGNED_TAGS.CONTRIBUTOR || "Contributor";
    })();

    const newMember = {
      id: uId,
      _id: uId,
      name: user.name,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: "Member",
      projectRole: initialRole,
      tags: [initialRole],
    };

    onChange([...taggedMembers, newMember]);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleToggleTag = (memberId, role) => {
    onChange(
      taggedMembers.map((m) => {
        const id = getMemberId(m);
        if (id?.toString() === memberId?.toString()) {
          const currentTags = getMemberTags(m);
          let newTags;
          if (currentTags.includes(role)) {
            newTags = currentTags.filter((t) => t !== role);
          } else {
            newTags = [...currentTags, role];
          }
          return {
            ...m,
            projectRole: newTags[0] || "Contributor",
            tags: newTags,
          };
        }
        return m;
      }),
    );
  };

  const handleRemoveTag = (memberId, roleToRemove) => {
    onChange(
      taggedMembers.map((m) => {
        const id = getMemberId(m);
        if (id?.toString() === memberId?.toString()) {
          const currentTags = getMemberTags(m);
          const newTags = currentTags.filter((t) => t !== roleToRemove);
          return {
            ...m,
            projectRole: newTags[0] || "Contributor",
            tags: newTags,
          };
        }
        return m;
      }),
    );
  };

  const handleAddCustomTag = (memberId) => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;

    onChange(
      taggedMembers.map((m) => {
        const id = getMemberId(m);
        if (id?.toString() === memberId?.toString()) {
          const currentTags = getMemberTags(m);
          if (currentTags.includes(trimmed)) return m;
          const newTags = [...currentTags, trimmed];
          return {
            ...m,
            projectRole: newTags[0] || trimmed,
            tags: newTags,
          };
        }
        return m;
      }),
    );
    setCustomTagInput("");
  };

  const handleRemoveMember = (memberId) => {
    onChange(
      taggedMembers.filter(
        (m) => getMemberId(m)?.toString() !== memberId?.toString(),
      ),
    );
    if (openPopoverMemberId?.toString() === memberId?.toString()) {
      setOpenPopoverMemberId(null);
      setPopoverCoords(null);
    }
  };

  const handleOpenPopover = (e, mId) => {
    e.stopPropagation();
    if (openPopoverMemberId?.toString() === mId?.toString()) {
      setOpenPopoverMemberId(null);
      setPopoverCoords(null);
      return;
    }
    triggerButtonRef.current = e.currentTarget;
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 280;

    setPopoverCoords({
      top: openUp ? undefined : rect.bottom + 6,
      bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
      right: window.innerWidth - rect.right,
    });
    setOpenPopoverMemberId(mId);
    setCustomTagInput("");
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Team Members
          {taggedMembers.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-primary">
              {taggedMembers.length} added
            </span>
          )}
        </label>
      </div>

      {/* 1. Search Bar at the TOP of the Team Members section */}
      <div ref={searchContainerRef} className="relative">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search team members by name, email, or role to add..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Autocomplete Search Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto z-20 divide-y divide-slate-100">
            {filteredSearchResults.length > 0 ? (
              filteredSearchResults.map((user) => {
                const uId = user.id || user._id;
                const alreadyTagged = isTagged(uId);

                return (
                  <div
                    key={uId}
                    onClick={() => {
                      if (!alreadyTagged) handleAddMember(user);
                    }}
                    className={`flex items-center justify-between p-2.5 transition-colors ${
                      alreadyTagged
                        ? "bg-slate-50/80 cursor-default"
                        : "hover:bg-indigo-50/50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <Avatar
                        src={user.avatar}
                        name={user.name}
                        size="xs"
                        className="w-6 h-6 rounded-full shrink-0 ring-1 ring-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {user.email ||
                            (user.username
                              ? `@${user.username}`
                              : user.role || "")}
                        </p>
                      </div>
                    </div>

                    {alreadyTagged ? (
                      <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 shrink-0">
                        <Check size={12} strokeWidth={2.5} />
                        <span>Added</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline shrink-0">
                        <Plus size={12} strokeWidth={2.5} />
                        <span>Add</span>
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No team members found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Added Members List: Compact, Inline Rows with Multi-Select Tag Badges & Popover */}
      <div className="space-y-1.5">
        {taggedMembers.length > 0 ? (
          <div className="space-y-1.5">
            {taggedMembers.map((member) => {
              const mId = getMemberId(member);
              const tags = getMemberTags(member);
              const isPopoverOpen =
                openPopoverMemberId?.toString() === mId?.toString();

              return (
                <div
                  key={mId}
                  className="flex items-center justify-between p-2 sm:px-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-2xs gap-2 min-h-11"
                >
                  {/* Left: Avatar + Name + Subtitle */}
                  <div className="flex items-center gap-2 min-w-30 sm:min-w-37.5 max-w-40 sm:max-w-50 shrink-0">
                    <Avatar
                      src={member.avatar || member.user?.avatar}
                      name={member.name || member.user?.name}
                      size="xs"
                      className="w-7 h-7 rounded-full shrink-0 ring-1 ring-slate-100"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {member.name || member.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {member.email ||
                          member.user?.email ||
                          (member.username ? `@${member.username}` : "")}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Assigned Tag Badges with 'x' */}
                  <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0 pr-1">
                    {tags.length > 0 ? (
                      tags.map((tag) => (
                        <span
                          key={tag}
                          style={
                            themeColor && themeColor !== "#4361EE"
                              ? {
                                  backgroundColor: `${themeColor}15`,
                                  color: themeColor,
                                  borderColor: `${themeColor}35`,
                                }
                              : undefined
                          }
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border shadow-2xs shrink-0 transition-all ${getAssignedTagStyle(tag)}`}
                        >
                          <span className="truncate max-w-22.5 sm:max-w-30">
                            {tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(mId, tag)}
                            className="opacity-70 hover:opacity-100 rounded p-0.5 transition-opacity cursor-pointer"
                            title={`Remove ${tag} role`}
                            aria-label={`Remove ${tag} role`}
                          >
                            <X size={9} strokeWidth={2.5} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10.5px] text-slate-400 italic">
                        No roles
                      </span>
                    )}
                  </div>

                  {/* Right Actions: [+ Add Role ▾] & [Delete Member Button] */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Add Role Popover Trigger */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenPopover(e, mId)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        isPopoverOpen
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/90 hover:border-slate-300"
                      }`}
                      title="Add or toggle roles"
                    >
                      <Plus size={11} strokeWidth={2.5} />
                      <span>Role</span>
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-150 ${
                          isPopoverOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Delete Member Button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(mId)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title={`Remove ${member.name || member.user?.name} from project`}
                      aria-label={`Remove ${member.name || member.user?.name} from project`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-xs font-medium">
            No team members added yet. Search above to add contributors.
          </div>
        )}
      </div>

      {/* Portaled Multi-Select Roles Popover to escape all scroll and overflow clipping */}
      {openPopoverMemberId &&
        popoverCoords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: "fixed",
              top:
                popoverCoords.top !== undefined
                  ? `${popoverCoords.top}px`
                  : "auto",
              bottom:
                popoverCoords.bottom !== undefined
                  ? `${popoverCoords.bottom}px`
                  : "auto",
              right: `${popoverCoords.right}px`,
              zIndex: 9999,
            }}
            className="w-56 sm:w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 space-y-2 animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Tag size={12} className="text-primary" />
                <span>Select Roles</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpenPopoverMemberId(null);
                  setPopoverCoords(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Custom Role Input */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag(openPopoverMemberId);
                  }
                }}
                placeholder="Custom role..."
                className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => handleAddCustomTag(openPopoverMemberId)}
                disabled={!customTagInput.trim()}
                className="p-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                title="Add custom role"
              >
                <Plus size={11} strokeWidth={2.5} />
              </button>
            </div>

            {/* Quick Roles Checkbox List */}
            <div className="max-h-44 overflow-y-auto space-y-0.5 divide-y divide-slate-50 pr-0.5">
              {QUICK_ROLES.map((role) => {
                const activeMember = taggedMembers.find(
                  (m) =>
                    getMemberId(m)?.toString() ===
                    openPopoverMemberId?.toString(),
                );
                const activeMemberTags = activeMember
                  ? getMemberTags(activeMember)
                  : [];
                const isChecked = activeMemberTags.includes(role);
                return (
                  <div
                    key={role}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTag(openPopoverMemberId, role);
                    }}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors text-xs select-none"
                  >
                    <span
                      className={`text-[11px] ${
                        isChecked
                          ? "text-primary font-bold"
                          : "text-slate-700 font-medium"
                      }`}
                    >
                      {role}
                    </span>
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                        isChecked
                          ? "bg-primary border-primary text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

export default ProjectMemberTagSelector;
