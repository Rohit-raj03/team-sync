import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Check,
  Users,
  Plus,
  Tag,
  Sparkles,
  ChevronRight,
  UserCheck,
  SlidersHorizontal,
} from "lucide-react";
import { useTeam } from "../../team/hooks/useTeam.js";
import { Avatar } from "../../../shared/components/ui/Avatar.jsx";

export const DEFAULT_PRESET_TAGS = [
  "Project Lead",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "UI/UX Designer",
  "QA Reviewer",
  "DevOps Engineer",
  "Product Manager",
  "Contributor",
];

/**
 * Feature Component: ProjectMemberTagSelector
 * Layer: features/projects/components/
 * Responsibility:
 * 1. User selects a member first from the list.
 * 2. An interactive tagging panel activates for the selected member to assign multiple default/custom tags.
 * 3. Member can have custom tags typed on the fly.
 * 4. Tagged members are shown with all assigned tags and can be edited or next member selected.
 */
export const ProjectMemberTagSelector = ({
  taggedMembers = [],
  onChange,
  error,
}) => {
  const { members } = useTeam();
  const [searchQuery, setSearchQuery] = useState("");
  // Currently active/focused member for tagging
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  // Custom tag input field state
  const [customTagInput, setCustomTagInput] = useState("");

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        (m.username && m.username.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [members, searchQuery]);

  // Find tagged record by member id
  const getTaggedRecord = (memberId) => {
    return taggedMembers.find(
      (m) => (m.id || m._id)?.toString() === memberId?.toString()
    );
  };

  const isTagged = (memberId) => Boolean(getTaggedRecord(memberId));

  // Retrieve current member object selected in the active panel
  const activeMember = useMemo(() => {
    if (!selectedMemberId) return null;
    const tagged = getTaggedRecord(selectedMemberId);
    if (tagged) return tagged;
    return (
      members.find(
        (m) => (m.id || m._id)?.toString() === selectedMemberId?.toString()
      ) || null
    );
  }, [selectedMemberId, taggedMembers, members]);

  // Get list of tags for a member (from tagged record or default suggestion)
  const getMemberTags = (memberId) => {
    const tagged = getTaggedRecord(memberId);
    if (tagged?.tags && Array.isArray(tagged.tags) && tagged.tags.length > 0) {
      return tagged.tags;
    }
    if (tagged?.projectRole) {
      return [tagged.projectRole];
    }
    return [];
  };

  // Toggle or add a tag for a member
  const handleToggleTag = (member, tagToAdd) => {
    const mId = member.id || member._id;
    const currentTags = getMemberTags(mId);
    let updatedTags;

    if (currentTags.includes(tagToAdd)) {
      // Remove tag
      updatedTags = currentTags.filter((t) => t !== tagToAdd);
    } else {
      // Add tag
      updatedTags = [...currentTags, tagToAdd];
    }

    if (updatedTags.length === 0) {
      // If no tags left, fallback to Contributor or keep member with Contributor
      updatedTags = ["Contributor"];
    }

    const updatedMemberObj = {
      ...member,
      id: mId,
      _id: mId,
      role: member.role || "Member",
      projectRole: updatedTags[0] || "Contributor",
      tags: updatedTags,
    };

    if (isTagged(mId)) {
      onChange(
        taggedMembers.map((m) =>
          (m.id || m._id)?.toString() === mId?.toString() ? updatedMemberObj : m
        )
      );
    } else {
      onChange([...taggedMembers, updatedMemberObj]);
    }
  };

  // Add custom typed tag for active member
  const handleAddCustomTag = (e) => {
    e?.preventDefault();
    if (!customTagInput.trim() || !activeMember) return;
    const newTag = customTagInput.trim();

    handleToggleTag(activeMember, newTag);
    setCustomTagInput("");
  };

  // Untag member completely from project
  const handleRemoveMember = (memberId, e) => {
    e?.stopPropagation();
    onChange(
      taggedMembers.filter(
        (m) => (m.id || m._id)?.toString() !== memberId?.toString()
      )
    );
    if (selectedMemberId?.toString() === memberId?.toString()) {
      setSelectedMemberId(null);
    }
  };

  // When clicking on a member from the list: select them first
  const handleSelectMember = (member) => {
    const mId = member.id || member._id;

    // If not yet tagged, initialize them with a smart default role tag
    if (!isTagged(mId)) {
      const defaultRole = (() => {
        const title = (member.role || "").toLowerCase();
        if (title.includes("design") || title.includes("ui") || title.includes("ux"))
          return "UI/UX Designer";
        if (title.includes("frontend")) return "Frontend Developer";
        if (title.includes("backend")) return "Backend Developer";
        if (title.includes("full") || title.includes("stack"))
          return "Full Stack Developer";
        if (title.includes("qa") || title.includes("test")) return "QA Reviewer";
        if (title.includes("lead") || title.includes("manager")) return "Project Lead";
        if (title.includes("devops") || title.includes("cloud")) return "DevOps Engineer";
        return "Contributor";
      })();

      const newMemberObj = {
        ...member,
        id: mId,
        _id: mId,
        role: "Member",
        projectRole: defaultRole,
        tags: [defaultRole],
      };
      onChange([...taggedMembers, newMemberObj]);
    }

    setSelectedMemberId(mId);
  };

  const activeMemberTags = activeMember ? getMemberTags(activeMember.id || activeMember._id) : [];

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Project Contributors & Member Tagging{" "}
            <span className="text-slate-400 font-normal">
              ({taggedMembers.length} tagged)
            </span>
          </label>
          <p className="text-[11px] text-slate-400 font-medium">
            Select a member from the list below to define their tags and custom roles.
          </p>
        </div>
      </div>

      {/* 1. Tagged Members Overview Section */}
      {taggedMembers.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Tagged in Project ({taggedMembers.length}):</span>
            <span className="text-slate-400 font-normal text-[10px]">
              Click any member card to adjust tags
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 max-h-36 overflow-y-auto">
            {taggedMembers.map((member) => {
              const mId = member.id || member._id;
              const isSelected = selectedMemberId?.toString() === mId?.toString();
              const tags = getMemberTags(mId);

              return (
                <div
                  key={mId}
                  onClick={() => setSelectedMemberId(mId)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-200 shadow-xs"
                      : "bg-white border-slate-200/90 hover:border-indigo-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="xs"
                      className="w-6 h-6 rounded-full shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {member.name}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-[#4361EE] border border-indigo-100"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRemoveMember(mId, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                    title={`Untag ${member.name}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Interactive Tagging Panel for the Currently Selected Member */}
      {activeMember && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3 animate-in fade-in zoom-in-98 duration-150 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                src={activeMember.avatar}
                name={activeMember.name}
                size="sm"
                className="w-7 h-7 ring-2 ring-indigo-300"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {activeMember.name}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-indigo-100 text-[#4361EE]">
                    Selected for Tagging
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Select predefined tags or enter custom role tags for this member.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
              title="Close tagging panel"
            >
              <X size={14} />
            </button>
          </div>

          {/* Current Active Tags for this Member */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-600 mr-1 flex items-center gap-1">
              <Tag size={12} className="text-[#4361EE]" />
              <span>Assigned Tags:</span>
            </span>
            {activeMemberTags.length > 0 ? (
              activeMemberTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-[#4361EE] text-white shadow-2xs animate-in fade-in"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleTag(activeMember, tag)}
                    className="hover:bg-white/20 rounded p-0.5 transition-colors"
                    title={`Remove ${tag} tag`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-400 italic">
                No tags assigned yet. Select options below.
              </span>
            )}
          </div>

          {/* Predefined Tag Pills */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quick Tag Options (Click to toggle)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_PRESET_TAGS.map((tag) => {
                const isSelected = activeMemberTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(activeMember, tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs scale-102 ring-1 ring-indigo-400"
                        : "bg-white hover:bg-indigo-50/80 text-slate-700 border border-slate-200/90"
                    }`}
                  >
                    {isSelected && <Check size={11} strokeWidth={3} />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Role Tag Input */}
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <Tag
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="Type custom tag (e.g. Scrum Master, SEO Specialist, Tech Lead)..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4361EE]"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomTag}
              disabled={!customTagInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-[#4361EE] hover:bg-[#3451DE] active:scale-95 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus size={12} strokeWidth={2.5} />
              <span>Add Custom Tag</span>
            </button>
          </div>

          {/* Prompt / Helper text for next member */}
          <div className="flex items-center justify-between pt-1 border-t border-indigo-100 text-[10px] text-slate-500 font-medium">
            <span>Tags saved automatically for this member.</span>
            <button
              type="button"
              onClick={() => setSelectedMemberId(null)}
              className="text-[#4361EE] font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Done (Select Next Member Below)</span>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
      )}

      {/* 3. Search Bar for Team Members */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search team members by name, email, or title to select..."
          className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs bg-white placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4361EE] shadow-2xs"
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

      {/* 4. Team Member Selection List: Click member to select and tag */}
      <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-2xs">
        <div className="max-h-40 sm:max-h-44 overflow-y-auto divide-y divide-slate-100">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const mId = member.id || member._id;
              const tagged = isTagged(mId);
              const isSelected = selectedMemberId?.toString() === mId?.toString();
              const tags = getMemberTags(mId);

              return (
                <div
                  key={mId}
                  onClick={() => handleSelectMember(member)}
                  className={`flex items-center justify-between p-2.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 border-l-4 border-l-[#4361EE]"
                      : tagged
                      ? "bg-emerald-50/20 hover:bg-slate-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="sm"
                      className="ring-1 ring-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {member.name}
                        </p>
                        {member.username && (
                          <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {member.role || "Team Member"}
                      </p>
                    </div>
                  </div>

                  {/* Right Action: Select / Tagged Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    {tagged ? (
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-wrap gap-1 max-w-[150px] justify-end">
                          {tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-[#4361EE] border border-indigo-100"
                            >
                              {t}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span className="text-[9px] font-bold text-slate-400">
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                          <span>{isSelected ? "Editing" : "Tagged"}</span>
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-[#4361EE] hover:text-white text-slate-700 text-[11px] font-bold shadow-2xs flex items-center gap-1 transition-all">
                        <Plus size={12} strokeWidth={2.5} />
                        <span>Select & Tag</span>
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

export default ProjectMemberTagSelector;
