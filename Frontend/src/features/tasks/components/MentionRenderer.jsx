import React from "react";
import { AtSign } from "lucide-react";

/**
 * Feature Component: MentionRenderer
 * Parses and renders text with @mentions formatted as interactive styled chips
 */
export const MentionRenderer = ({ text = "", className = "" }) => {
  if (!text) return null;

  // Regex to split by structured mentions @[Name](id) or @username
  const regex = /(@\[([^\]]+)\]\(([a-fA-F0-9]{24}|[a-zA-Z0-9_-]+)\)|@([a-zA-Z0-9_.-]+))/g;

  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // Structured match: match[2] is Name, match[3] is UserID
      const name = match[2];
      const userId = match[3];
      elements.push(
        <span
          key={`mention-${match.index}`}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-primary font-bold text-[11px] align-baseline transition-colors hover:bg-indigo-100"
          title={`User ID: ${userId}`}
        >
          <AtSign size={10} className="stroke-[2.5]" />
          <span>{name}</span>
        </span>
      );
    } else if (match[4]) {
      // Plain @username match
      const username = match[4];
      elements.push(
        <span
          key={`mention-user-${match.index}`}
          className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-primary font-bold text-[11px] align-baseline transition-colors hover:bg-indigo-100"
        >
          <AtSign size={10} className="stroke-[2.5]" />
          <span>{username}</span>
        </span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining trailing text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <span className={className}>{elements}</span>;
};

export default MentionRenderer;
