import React, { useState, useRef, useEffect } from "react";
import { AtSign } from "lucide-react";

/**
 * Feature Component: MentionTextarea
 * Implements full @mention autocomplete with keyboard navigation, project member filtering,
 * and stable user ID representation: @[Member Name](userId)
 */
export const MentionTextarea = ({
  value = "",
  onChange,
  projectMembers = [],
  placeholder = "Type your text here... Use @ to mention team members",
  rows = 3,
  className = "",
  disabled = false,
}) => {
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter project members according to mention query
  const filteredMembers = React.useMemo(() => {
    if (!mentionQuery) return projectMembers.slice(0, 8);
    const q = mentionQuery.toLowerCase();
    return projectMembers
      .filter((m) => {
        const name = (m.name || "").toLowerCase();
        const username = (m.username || "").toLowerCase();
        return name.includes(q) || username.includes(q);
      })
      .slice(0, 8);
  }, [projectMembers, mentionQuery]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredMembers]);

  // Handle text changes and detect '@'
  const handleTextChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;

    // Check if cursor is right after an '@' or word starting with '@'
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtMatch = textBeforeCursor.match(/@([a-zA-Z0-9_.-]*)$/);

    if (lastAtMatch) {
      setMentionStartIndex(lastAtMatch.index);
      setMentionQuery(lastAtMatch[1]);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    // Collect all existing mention user IDs in the text
    const structuredRegex = /@\[([^\]]+)\]\(([a-fA-F0-9]{24}|[a-zA-Z0-9_-]+)\)/g;
    const mentions = [];
    let match;
    while ((match = structuredRegex.exec(text)) !== null) {
      mentions.push(match[2]);
    }

    onChange?.(text, mentions);
  };

  // Insert selected member mention
  const insertMention = (member) => {
    const memberId = member.id || member._id;
    const memberName = member.name || member.username;
    const beforeMention = value.slice(0, mentionStartIndex);
    const afterMention = value.slice(
      mentionStartIndex + mentionQuery.length + 1
    );

    // Format as stable structured mention @[Name](id)
    const mentionToken = `@[${memberName}](${memberId}) `;
    const newText = `${beforeMention}${mentionToken}${afterMention}`;

    // Extract all mentions
    const structuredRegex = /@\[([^\]]+)\]\(([a-fA-F0-9]{24}|[a-zA-Z0-9_-]+)\)/g;
    const mentions = [];
    let match;
    while ((match = structuredRegex.exec(newText)) !== null) {
      mentions.push(match[2]);
    }

    onChange?.(newText, mentions);
    setIsOpen(false);

    // Reset focus and cursor position after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionToken.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (!isOpen || filteredMembers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredMembers.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insertMention(filteredMembers[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#4361EE] focus:border-transparent transition-all resize-none shadow-xs ${className}`}
      />

      {/* Floating Autocomplete Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 bottom-full mb-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <AtSign size={12} className="text-[#4361EE]" />
              <span>Mention Project Member</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              ↑↓ to navigate, Enter to pick
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, index) => {
                const isHighlighted = index === selectedIndex;
                const memberName = member.name || member.username;
                return (
                  <div
                    key={member.id || member._id || index}
                    onClick={() => insertMention(member)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                      isHighlighted
                        ? "bg-indigo-50/80 text-[#4361EE]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <img
                      src={
                        member.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(memberName)}`
                      }
                      alt={memberName}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{memberName}</p>
                      {member.username && (
                        <p className="text-[10px] text-slate-400 truncate">
                          @{member.username}
                        </p>
                      )}
                    </div>
                    {member.projectRole && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                        {member.projectRole}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-400">
                No project members match "@{mentionQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MentionTextarea;
