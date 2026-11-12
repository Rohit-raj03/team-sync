import React, { useState } from "react";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  X,
} from "lucide-react";

/**
 * Feature Component: NewTaskWidget
 * Layer: features/dashboard/components/
 * Responsibility: Exact reproduction of the "New Task" creator widget with emoji reaction picker, collaborator pills, and submit button matching Figma.
 */
export const NewTaskWidget = () => {
  const [taskTitle, setTaskTitle] = useState("Create new");
  const [selectedEmoji, setSelectedEmoji] = useState("🔥");

  const emojis = ["🎉", "😍", "😂", "🔥", "🥳", "😇", "😎", "🤕", "🥱"];

  const collaborators = [
    {
      id: "1",
      name: "Angela",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
      color: "bg-[#F0EFFE] text-[#7064F6]",
    },
    {
      id: "2",
      name: "Chris",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces",
      color: "bg-sky-50 text-sky-700 border border-sky-100",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header: New Task + More */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          New Task
        </h3>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Task Title Field */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
          Task Title
        </label>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Create new task..."
          className="w-full px-4 py-2.5 bg-[#F4F7FB] text-xs font-semibold text-slate-800 rounded-2xl border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Emoji Reaction Bar */}
      <div className="flex items-center justify-between py-1 px-1">
        <button className="text-slate-300 hover:text-slate-600">
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`text-base p-1 rounded-lg transition-transform hover:scale-125 ${
                selectedEmoji === emoji
                  ? "scale-125 drop-shadow-xs"
                  : "opacity-80"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <button className="text-slate-300 hover:text-slate-600">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Add Collaborators */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-2">
          Add Collaborators
        </label>

        <div className="flex items-center gap-2">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full text-xs font-bold ${c.color}`}
            >
              <img
                src={c.avatar}
                alt={c.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{c.name}</span>
              <button className="hover:opacity-75 ml-0.5">
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Plus Add Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
          >
            <Plus size={15} />
          </button>

          {/* Submit Arrow Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-md shadow-indigo-300 ml-auto shrink-0 transition-transform active:scale-95"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskWidget;
