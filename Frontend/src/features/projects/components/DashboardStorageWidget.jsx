import React from 'react';
import { HardDrive } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card.jsx';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar.jsx';

/**
 * Feature Component: DashboardStorageWidget
 * Layer: features/projects/components/
 * Responsibility: Renders circular capacity meter and storage category distribution matching Figma Screen 1.
 */
export const DashboardStorageWidget = () => {
  const percentage = 76;
  const strokeDashoffset = 283 - (283 * percentage) / 100;

  const categories = [
    { label: 'Media & Assets', size: '12.4 GB', color: 'indigo', progress: 54 },
    { label: 'Documents & Specs', size: '8.2 GB', color: 'cyan', progress: 32 },
    { label: 'Code & Repositories', size: '4.1 GB', color: 'purple', progress: 14 },
  ];

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">Available Storage</h3>
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <HardDrive size={18} />
        </div>
      </div>

      {/* Circular Progress Gauge */}
      <div className="flex flex-col items-center justify-center my-3 relative">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="10"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="url(#storageGradient)"
              strokeWidth="10"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="storageGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Percentage */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900">{percentage}%</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Used</span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-medium">24.7 GB of 32 GB used</p>
      </div>

      {/* Categories Breakdown */}
      <div className="space-y-3 mt-4 pt-4 border-t border-slate-50">
        {categories.map((c, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600">{c.label}</span>
              <span className="text-slate-400">{c.size}</span>
            </div>
            <ProgressBar progress={c.progress} color={c.color} height="h-1.5" />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default DashboardStorageWidget;

