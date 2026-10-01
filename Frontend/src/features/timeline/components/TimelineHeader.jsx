import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Plus, Filter } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button.jsx';

/**
 * Feature Component: TimelineHeader
 * Layer: features/timeline/components/
 * Responsibility: Header controls for the Timeline page including month navigation, view mode toggles, and milestone actions.
 */
export const TimelineHeader = ({ onAddMilestone }) => {
  const [viewMode, setViewMode] = useState('Month');
  const modes = ['Day', 'Week', 'Month', 'Quarter'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Month Title & Navigation */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Timeline & Schedule</h2>
          <p className="text-xs text-slate-400 mt-0.5">Sprint roadmaps, deliverables, and team milestone tracking</p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-2xs">
          <button className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-slate-700 px-2 flex items-center gap-1.5">
            <Calendar size={13} className="text-indigo-600" />
            September 2026
          </span>
          <button className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Right: View Toggles & CTA */}
      <div className="flex flex-wrap items-center gap-3">
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-full border border-slate-100 shadow-2xs">
          {modes.map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                viewMode === mode
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Filter button */}
        <button className="p-2.5 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl text-slate-500 shadow-2xs">
          <Filter size={16} />
        </button>

        {/* Create Milestone */}
        <Button
          onClick={onAddMilestone}
          className="rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
        >
          <Plus size={15} />
          <span>Add Milestone</span>
        </Button>
      </div>
    </div>
  );
};

export default TimelineHeader;

