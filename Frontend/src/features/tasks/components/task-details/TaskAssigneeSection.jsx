import React, { useState } from "react";
import { Users, UserPlus, Search, Check, X } from "lucide-react";
import { Avatar } from "../../../../shared/components/ui/Avatar.jsx";

export const TaskAssigneeSection = ({
  assignees = [],
  effectiveMembers = [],
  onToggleAssignee,
  onRemoveAssignee,
}) => {
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  const filteredTeamMembers = effectiveMembers.filter((m) => {
    const q = memberSearchQuery.toLowerCase();
    const name = (m.name || "").toLowerCase();
    const username = (m.username || "").toLowerCase();
    const role = (m.role || m.projectRole || "").toLowerCase();
    return name.includes(q) || username.includes(q) || role.includes(q);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-slate-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Assigned Employees ({assignees.length})
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAssigneePickerOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover transition-colors cursor-pointer"
        >
          <UserPlus size={13} />
          <span>
            {isAssigneePickerOpen ? "Done Editing" : "+ Edit Assignees"}
          </span>
        </button>
      </div>

      {/* Inline Employee Multi-Select Picker */}
      {isAssigneePickerOpen && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3 animate-in fade-in duration-150">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search employees to assign or remove..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200/80">
            {filteredTeamMembers.map((member) => {
              const isAssigned = assignees.some(
                (a) => (a.id || a._id) === (member.id || member._id)
              );
              return (
                <div
                  key={member.id || member._id}
                  onClick={() => onToggleAssignee?.(member)}
                  className={`flex items-center justify-between p-2 cursor-pointer transition-colors ${
                    isAssigned ? "bg-indigo-50/60" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isAssigned
                          ? "bg-primary border-primary text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isAssigned && <Check size={11} strokeWidth={3} />}
                    </div>

                    <Avatar
                      src={member.avatar}
                      name={member.name}
                      size="xs"
                      className="ring-1 ring-slate-100"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {member.role || "Member"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isAssigned
                        ? "bg-indigo-100 text-primary"
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {isAssigned ? "Assigned" : "+ Add"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Assigned Employees Cards */}
      {assignees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {assignees.map((user) => (
            <div
              key={user.id || user._id}
              className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all group"
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
                    {user.role || "Member"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => onRemoveAssignee?.(user.id || user._id, e)}
                title={`Remove ${user.name}`}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-medium">
            No employees assigned to this task.
          </p>
          <button
            type="button"
            onClick={() => setIsAssigneePickerOpen(true)}
            className="text-xs font-bold text-primary hover:underline mt-0.5 cursor-pointer"
          >
            + Assign employees now
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskAssigneeSection;
