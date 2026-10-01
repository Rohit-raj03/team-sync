import React from "react";
import { LayoutGrid, Calendar, Phone, MoreVertical } from "lucide-react";

/**
 * Feature Component: TodayScheduleWidget
 * Layer: features/dashboard/components/
 * Responsibility: Renders "Today's Scheudle" widget with project discovery call card and participant stack matching Figma.
 */
export const TodayScheduleWidget = () => {
  return (
    <div className="space-y-3">
      {/* Header: Today's Scheudle + View toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Today's Scheudle
        </h3>
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs text-slate-400">
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <LayoutGrid size={15} />
          </button>
          <button className="p-1 rounded-lg text-slate-700">
            <Calendar size={15} />
          </button>
        </div>
      </div>

      {/* Subtitle link */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-[#00C2FF]">30 minute call with Client</span>
        <button className="text-[#00C2FF] hover:underline">+ Invite</button>
      </div>

      {/* Meeting Title */}
      <h4 className="text-base font-bold text-slate-900">
        Project Discovery Call
      </h4>

      {/* Blue Call Card */}
      <div className="p-4 rounded-3xl bg-[#4361EE] text-white flex items-center justify-between shadow-md shadow-indigo-200">
        {/* Avatar Stack */}
        <div className="flex items-center -space-x-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
            alt="Participant"
            className="w-8 h-8 rounded-full border-2 border-[#4361EE] object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
            alt="Participant"
            className="w-8 h-8 rounded-full border-2 border-[#4361EE] object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces"
            alt="Participant"
            className="w-8 h-8 rounded-full border-2 border-[#4361EE] object-cover"
          />
          <div className="w-8 h-8 rounded-full bg-white text-[#4361EE] font-bold text-xs flex items-center justify-center border-2 border-[#4361EE]">
            R
          </div>
        </div>

        {/* Call Timer & Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-wider">28:35</span>
          <button className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <Phone size={14} className="text-white" />
          </button>
          <button className="text-white/80 hover:text-white">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodayScheduleWidget;
