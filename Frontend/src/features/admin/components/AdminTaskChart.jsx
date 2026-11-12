import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, ArrowUpRight } from 'lucide-react';

/**
 * Feature Component: AdminTaskChart
 * Layer: features/admin/components/
 * Responsibility: Interactive visual chart representing task completion velocity and weekly/monthly throughput.
 */
export const AdminTaskChart = () => {
  const [activeRange, setActiveRange] = useState('Weekly');

  const chartData = {
    Daily: [
      { label: 'Mon', completed: 8, created: 10 },
      { label: 'Tue', completed: 12, created: 14 },
      { label: 'Wed', completed: 9, created: 11 },
      { label: 'Thu', completed: 15, created: 12 },
      { label: 'Fri', completed: 18, created: 16 },
      { label: 'Sat', completed: 6, created: 4 },
      { label: 'Sun', completed: 4, created: 3 },
    ],
    Weekly: [
      { label: 'W1', completed: 24, created: 30 },
      { label: 'W2', completed: 38, created: 35 },
      { label: 'W3', completed: 45, created: 40 },
      { label: 'W4', completed: 52, created: 48 },
    ],
    Monthly: [
      { label: 'May', completed: 110, created: 125 },
      { label: 'Jun', completed: 145, created: 150 },
      { label: 'Jul', completed: 160, created: 155 },
      { label: 'Aug', completed: 195, created: 180 },
      { label: 'Sep', completed: 210, created: 200 },
    ],
  };

  const currentData = chartData[activeRange] || chartData.Weekly;
  const maxVal = Math.max(...currentData.map((d) => Math.max(d.completed, d.created))) * 1.15;

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100/90 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Task Velocity & Completion Rate
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
              <TrendingUp size={11} /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Throughput comparison between created and completed tasks
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {['Daily', 'Weekly', 'Monthly'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeRange === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Dual-Spline / Bar Chart Representation */}
      <div className="h-52 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
        {currentData.map((item, idx) => {
          const completedHeight = Math.round((item.completed / maxVal) * 100);
          const createdHeight = Math.round((item.created / maxVal) * 100);

          return (
            <div key={item.day || item.date || item.label || idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Created bar */}
                <div
                  className="w-3 sm:w-4 rounded-t-lg bg-indigo-100 group-hover:bg-indigo-200 transition-all duration-300 relative"
                  style={{ height: `${createdHeight}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-slate-900 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    Created: {item.created}
                  </span>
                </div>

                {/* Completed bar */}
                <div
                  className="w-3 sm:w-4 rounded-t-lg bg-primary group-hover:bg-primary-hover transition-all duration-300 relative shadow-xs"
                  style={{ height: `${completedHeight}%` }}
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-10">
                    Done: {item.completed}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-700 transition-colors">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chart Legend Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-semibold text-slate-700">Completed Tasks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />
            <span className="font-semibold text-slate-500">Tasks Created</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-medium">
          Updated in real-time
        </span>
      </div>
    </div>
  );
};

