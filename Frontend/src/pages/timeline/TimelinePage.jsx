import React from 'react';
import { TimelineHeader } from '../../features/timeline/components/TimelineHeader.jsx';
import { TimelineSummaryCards } from '../../features/timeline/components/TimelineSummaryCards.jsx';
import { TimelineCalendarGrid } from '../../features/timeline/components/TimelineCalendarGrid.jsx';

/**
 * Presentation Layer: TimelinePage (Screen 2 from Figma)
 * Layer: pages/timeline/
 * Responsibility: Assembles the timeline schedule view, sprint milestones, and interactive Gantt calendar.
 */
export const TimelinePage = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header with Controls & View Filters */}
      <TimelineHeader />

      {/* 2. Sprint KPI Overview Cards */}
      <TimelineSummaryCards />

      {/* 3. Gantt Milestone & Track Schedule Grid */}
      <TimelineCalendarGrid />
    </div>
  );
};

export default TimelinePage;

