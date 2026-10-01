import React from 'react';
import { Flag, CheckCircle, Clock, Zap } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card.jsx';

/**
 * Feature Component: TimelineSummaryCards
 * Layer: features/timeline/components/
 * Responsibility: Displays quick sprint metrics and status cards at the top of the timeline.
 */
export const TimelineSummaryCards = () => {
  const stats = [
    {
      label: 'Active Sprints',
      value: '03',
      subtext: 'Sprint 24 in progress',
      icon: Zap,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Deliverables Completed',
      value: '18 / 24',
      subtext: '75% completion rate',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Upcoming Milestones',
      value: '06',
      subtext: 'Next in 3 days',
      icon: Flag,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Estimated Velocity',
      value: '42 pts',
      subtext: '+14% vs last cycle',
      icon: Clock,
      color: 'bg-cyan-50 text-cyan-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <Card key={idx} hover className="p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{s.subtext}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TimelineSummaryCards;

