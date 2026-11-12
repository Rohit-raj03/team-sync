import React from "react";
import { Tag, MessageSquare } from "lucide-react";
import { deriveProjectColorTokens } from "../../../timeline/utils/timelineColors.js";

export const TaskMetadataSection = ({
  tags = [],
  project,
  taskProject,
  comment,
}) => {
  const projColor =
    project?.themeColor ||
    project?.color ||
    taskProject?.themeColor ||
    taskProject?.color ||
    "#4361EE";
  const tokens = deriveProjectColorTokens(projColor);

  return (
    <div className="space-y-4">
      {/* Tags (Metadata) */}
      {tags && tags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Tag size={13} style={{ color: tokens.primary }} />
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Tags & Labels
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const label = t.startsWith("#") ? t.slice(1) : t;
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs"
                  style={{
                    backgroundColor: tokens.bgLight,
                    color: tokens.badgeText,
                    borderColor: tokens.border,
                  }}
                >
                  <Tag size={10} style={{ color: tokens.primary }} />
                  <span>#{label}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Handover Note */}
      {comment && (
        <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
            <MessageSquare size={13} />
            <span>Handover Note</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{comment}</p>
        </div>
      )}
    </div>
  );
};

export default TaskMetadataSection;
