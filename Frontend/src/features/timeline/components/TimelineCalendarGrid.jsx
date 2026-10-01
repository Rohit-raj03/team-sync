import React, { useState } from 'react';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

/**
 * Feature Component: TimelineCalendarGrid
 * Layer: features/timeline/components/
 * Responsibility: Interactive Gantt and sprint schedule grid showing tasks spanning dates matching Figma Screen 2.
 */
export const TimelineCalendarGrid = () => {
  const [activeTask, setActiveTask] = useState(null);

  const days = [
    { num: 21, day: 'Mon' },
    { num: 22, day: 'Tue' },
    { num: 23, day: 'Wed' },
    { num: 24, day: 'Thu', isToday: true },
    { num: 25, day: 'Fri' },
    { num: 26, day: 'Sat' },
    { num: 27, day: 'Sun' },
    { num: 28, day: 'Mon' },
    { num: 29, day: 'Tue' },
    { num: 30, day: 'Wed' },
  ];

  const tracks = [
    {
      id: 't-1',
      title: 'Design System & UI Kit',
      category: 'Design',
      tasks: [
        {
          id: 'task-1',
          name: 'OCTOM Tokens & Components',
          startCol: 1, // Mon 21
          span: 3, // 3 days
          color: 'from-indigo-600 to-blue-600',
          progress: 85,
          assignee: 'Sarah Chen',
          status: 'In Progress',
        },
        {
          id: 'task-2',
          name: 'Interactive Prototype Walkthrough',
          startCol: 4, // Thu 24
          span: 4,
          color: 'from-purple-600 to-indigo-600',
          progress: 40,
          assignee: 'Alex Johnson',
          status: 'Pending Review',
        },
      ],
    },
    {
      id: 't-2',
      title: 'Frontend Web App',
      category: 'Development',
      tasks: [
        {
          id: 'task-3',
          name: 'Dashboard Charts & Gantt View',
          startCol: 3, // Wed 23
          span: 4,
          color: 'from-cyan-500 to-teal-500',
          progress: 70,
          assignee: 'David Kim',
          status: 'Active',
        },
        {
          id: 'task-4',
          name: 'Mobile Responsive Shell',
          startCol: 7, // Sun 27
          span: 3,
          color: 'from-emerald-500 to-teal-600',
          progress: 25,
          assignee: 'Elena Rostova',
          status: 'Planned',
        },
      ],
    },
    {
      id: 't-3',
      title: 'Backend & Cloud APIs',
      category: 'Engineering',
      tasks: [
        {
          id: 'task-5',
          name: 'WebSocket Event Bus',
          startCol: 2, // Tue 22
          span: 5,
          color: 'from-rose-500 to-pink-500',
          progress: 90,
          assignee: 'David Kim',
          status: 'Near Complete',
        },
      ],
    },
    {
      id: 't-4',
      title: 'QA & Security Audit',
      category: 'Quality Assurance',
      tasks: [
        {
          id: 'task-6',
          name: 'End-to-End Test Suite',
          startCol: 5, // Fri 25
          span: 4,
          color: 'from-amber-500 to-orange-500',
          progress: 15,
          assignee: 'Alex Johnson',
          status: 'Starting Soon',
        },
      ],
    },
  ];

  return (
    <Card className="p-0 overflow-hidden relative">
      {/* Scrollable Container for small screens */}
      <div className="overflow-x-auto">
        <div className="min-w-220">
          {/* Header Row: Track labels + Dates */}
          <div className="grid grid-cols-12 border-b border-slate-100 bg-[#F8FAFC]">
            {/* Left track column title */}
            <div className="col-span-3 p-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              Initiatives & Tracks
            </div>

            {/* Date Columns */}
            <div className="col-span-9 grid grid-cols-10 divide-x divide-slate-100">
              {days.map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-center transition-colors ${
                    d.isToday ? 'bg-indigo-50/50' : ''
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase text-slate-400">{d.day}</p>
                  <div
                    className={`mt-1 inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                      d.isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-800'
                    }`}
                  >
                    {d.num}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows for Tracks */}
          <div className="divide-y divide-slate-100">
            {tracks.map((track) => (
              <div key={track.id} className="grid grid-cols-12 min-h-24 hover:bg-slate-50/40 transition-colors">
                {/* Track Title */}
                <div className="col-span-3 p-4 px-6 flex flex-col justify-center">
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{track.title}</h4>
                  <span className="text-[11px] font-semibold text-slate-400 mt-1">{track.category}</span>
                </div>

                {/* Track Timeline Canvas */}
                <div className="col-span-9 grid grid-cols-10 divide-x divide-slate-100 relative p-3 items-center">
                  {/* Subtle column guide lines */}
                  {days.map((d, idx) => (
                    <div
                      key={idx}
                      className={`h-full pointer-events-none ${
                        d.isToday ? 'bg-indigo-50/20' : ''
                      }`}
                    />
                  ))}

                  {/* Absolute Task Bars */}
                  {track.tasks.map((task) => {
                    const leftPercent = ((task.startCol - 1) / 10) * 100;
                    const widthPercent = (task.span / 10) * 100;

                    return (
                      <div
                        key={task.id}
                        onMouseEnter={() => setActiveTask(task)}
                        onMouseLeave={() => setActiveTask(null)}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className={`absolute z-10 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r ${task.color} text-white shadow-md shadow-slate-200/50 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-lg transition-all group`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold truncate leading-tight">{task.name}</p>
                          <Avatar name={task.assignee} size="sm" className="w-5 h-5 text-[9px] border border-white/40" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/80 mt-1">
                          <span>{task.progress}%</span>
                          <span className="truncate max-w-20">{task.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Popover Inspector (matches the Figma sprint hover tooltip) */}
      {activeTask && (
        <div className="absolute bottom-4 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/20 border border-slate-800 z-30 animate-in fade-in zoom-in-95 max-w-xs">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Sprint Milestone
            </span>
            <span className="text-xs text-slate-400">{activeTask.status}</span>
          </div>
          <h5 className="font-bold text-sm leading-tight text-white mb-2">{activeTask.name}</h5>
          <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800">
            <span>Assignee: {activeTask.assignee}</span>
            <span className="font-bold text-emerald-400">{activeTask.progress}%</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TimelineCalendarGrid;

