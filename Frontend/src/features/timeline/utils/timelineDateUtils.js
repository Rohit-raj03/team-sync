/**
 * Utility: timelineDateUtils.js
 * Layer: features/timeline/utils/
 * Responsibility: Date range generation, Gantt coordinates calculation,
 * intelligent row packing for overlapping tasks, and timeline scale conversions.
 */

/**
 * Format a Date object to YYYY-MM-DD
 */
export function toISODate(date) {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
}

/**
 * Check if two dates are on the same calendar day
 */
export function isSameDay(d1, d2) {
  if (!d1 || !d2) return false;
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Resolve task start and due dates with safe fallbacks for missing data.
 */
export function resolveTaskDates(task) {
  const now = new Date();
  let start = task.startDate ? new Date(task.startDate) : null;
  let due = task.dueDate ? new Date(task.dueDate) : null;

  if (start && isNaN(start.getTime())) start = null;
  if (due && isNaN(due.getTime())) due = null;

  if (start && !due) {
    // Missing due date -> default duration 2 days
    due = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000);
  } else if (!start && due) {
    // Missing start date -> default start 2 days before due
    start = new Date(due.getTime() - 2 * 24 * 60 * 60 * 1000);
  } else if (!start && !due) {
    // Missing both -> use createdAt or today
    const created = task.createdAt ? new Date(task.createdAt) : null;
    start = created && !isNaN(created.getTime()) ? created : new Date(now.setHours(0, 0, 0, 0));
    due = new Date(start.getTime() + 3 * 24 * 60 * 60 * 1000);
  }

  // Ensure due is not before start
  if (due.getTime() <= start.getTime()) {
    due = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  }

  return { startDate: start, dueDate: due };
}

/**
 * Generates timeline intervals and date bounds based on active scale mode.
 * Modes supported: 'Day', 'Week', 'Month', 'Quarter'
 */
export function generateTimelineRange(anchorDate = new Date(), mode = "Day") {
  const anchor = new Date(anchorDate);
  anchor.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const fullMonthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const intervals = [];
  let timelineStart;
  let timelineEnd;
  let rangeTitle = "";

  if (mode === "Day") {
    // 14 days window: 3 days before anchor, 10 days after
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - 3);

    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      intervals.push({
        id: `day-${toISODate(d)}`,
        date: d,
        label: dayNames[d.getDay()],
        subLabel: d.getDate(),
        monthLabel: monthNames[d.getMonth()],
        isToday: isSameDay(d, today),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
        startTime: d.getTime(),
        endTime: d.getTime() + 24 * 60 * 60 * 1000,
      });
    }

    timelineStart = intervals[0].startTime;
    timelineEnd = intervals[intervals.length - 1].endTime;

    const first = intervals[0].date;
    const last = intervals[intervals.length - 1].date;
    rangeTitle =
      first.getMonth() === last.getMonth()
        ? `${fullMonthNames[first.getMonth()]} ${first.getFullYear()}`
        : `${monthNames[first.getMonth()]} - ${monthNames[last.getMonth()]} ${last.getFullYear()}`;
  } else if (mode === "Week") {
    // 8 weekly intervals
    // Align anchor to start of week (Sunday or Monday)
    const dayOfWeek = anchor.getDay();
    const start = new Date(anchor);
    start.setDate(anchor.getDate() - dayOfWeek - 7); // 1 week prior

    for (let w = 0; w < 8; w++) {
      const wStart = new Date(start);
      wStart.setDate(start.getDate() + w * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);

      const hasToday = today >= wStart && today <= new Date(wEnd.getTime() + 24 * 60 * 60 * 1000);

      intervals.push({
        id: `week-${toISODate(wStart)}`,
        date: wStart,
        label: `W${Math.ceil((wStart.getDate() + 6) / 7)}`,
        subLabel:
          wStart.getMonth() === wEnd.getMonth()
            ? `${monthNames[wStart.getMonth()]} ${wStart.getDate()} - ${wEnd.getDate()}`
            : `${monthNames[wStart.getMonth()]} ${wStart.getDate()} - ${monthNames[wEnd.getMonth()]} ${wEnd.getDate()}`,
        monthLabel: fullMonthNames[wStart.getMonth()],
        isToday: hasToday,
        isWeekend: false,
        startTime: wStart.getTime(),
        endTime: wEnd.getTime() + 24 * 60 * 60 * 1000,
      });
    }

    timelineStart = intervals[0].startTime;
    timelineEnd = intervals[intervals.length - 1].endTime;
    rangeTitle = `${monthNames[intervals[0].date.getMonth()]} - ${monthNames[intervals[intervals.length - 1].date.getMonth()]} ${intervals[intervals.length - 1].date.getFullYear()}`;
  } else if (mode === "Month") {
    // 6 monthly intervals
    const start = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);

    for (let m = 0; m < 6; m++) {
      const mDate = new Date(start.getFullYear(), start.getMonth() + m, 1);
      const mEnd = new Date(start.getFullYear(), start.getMonth() + m + 1, 0, 23, 59, 59);

      const hasToday = today >= mDate && today <= mEnd;

      intervals.push({
        id: `month-${mDate.getFullYear()}-${mDate.getMonth()}`,
        date: mDate,
        label: monthNames[mDate.getMonth()],
        subLabel: `${mDate.getFullYear()}`,
        monthLabel: fullMonthNames[mDate.getMonth()],
        isToday: hasToday,
        isWeekend: false,
        startTime: mDate.getTime(),
        endTime: mEnd.getTime(),
      });
    }

    timelineStart = intervals[0].startTime;
    timelineEnd = intervals[intervals.length - 1].endTime;
    rangeTitle = `${intervals[0].date.getFullYear() === intervals[intervals.length - 1].date.getFullYear() ? intervals[0].date.getFullYear() : `${intervals[0].date.getFullYear()} - ${intervals[intervals.length - 1].date.getFullYear()}`}`;
  } else if (mode === "Quarter") {
    // 4 quarters
    const startYear = anchor.getFullYear();
    const quarters = [
      { q: "Q1", startM: 0, endM: 2 },
      { q: "Q2", startM: 3, endM: 5 },
      { q: "Q3", startM: 6, endM: 8 },
      { q: "Q4", startM: 9, endM: 11 },
    ];

    quarters.forEach((qObj) => {
      const qStart = new Date(startYear, qObj.startM, 1);
      const qEnd = new Date(startYear, qObj.endM + 1, 0, 23, 59, 59);
      const hasToday = today >= qStart && today <= qEnd;

      intervals.push({
        id: `quarter-${startYear}-${qObj.q}`,
        date: qStart,
        label: qObj.q,
        subLabel: `${monthNames[qObj.startM]} - ${monthNames[qObj.endM]}`,
        monthLabel: `${startYear}`,
        isToday: hasToday,
        isWeekend: false,
        startTime: qStart.getTime(),
        endTime: qEnd.getTime(),
      });
    });

    timelineStart = intervals[0].startTime;
    timelineEnd = intervals[intervals.length - 1].endTime;
    rangeTitle = `Year ${startYear}`;
  }

  // Calculate today indicator position percentage
  const totalMs = timelineEnd - timelineStart;
  const nowMs = Date.now();
  const todayPositionPercent =
    nowMs >= timelineStart && nowMs <= timelineEnd
      ? ((nowMs - timelineStart) / totalMs) * 100
      : null;

  return {
    intervals,
    timelineStart,
    timelineEnd,
    totalMs,
    todayPositionPercent,
    rangeTitle,
  };
}

/**
 * Shifts the anchor date forward or backward based on scale mode.
 */
export function shiftAnchorDate(currentAnchor, mode, direction = 1) {
  const d = new Date(currentAnchor);
  if (mode === "Day") {
    d.setDate(d.getDate() + direction * 7);
  } else if (mode === "Week") {
    d.setDate(d.getDate() + direction * 28);
  } else if (mode === "Month") {
    d.setMonth(d.getMonth() + direction * 3);
  } else if (mode === "Quarter") {
    d.setFullYear(d.getFullYear() + direction);
  }
  return d;
}

/**
 * Calculates horizontal Gantt bar position & width percentages within the timeline range.
 */
export function calculateTaskPosition(task, timelineStart, timelineEnd) {
  const { startDate, dueDate } = resolveTaskDates(task);
  const taskStart = startDate.getTime();
  const taskEnd = dueDate.getTime();
  const totalMs = timelineEnd - timelineStart;

  // Determine if task intersects with the current view
  const isVisible = taskEnd >= timelineStart && taskStart <= timelineEnd;

  // Clamped calculations for smooth visual rendering
  const effectiveStart = Math.max(taskStart, timelineStart);
  const effectiveEnd = Math.min(taskEnd, timelineEnd);

  const leftPercent = ((effectiveStart - timelineStart) / totalMs) * 100;
  // Ensure minimum visual width (at least 3.5% or 40px)
  const rawWidthPercent = ((effectiveEnd - effectiveStart) / totalMs) * 100;
  const widthPercent = Math.max(3.5, rawWidthPercent);

  return {
    leftPercent: Math.max(0, Math.min(98, leftPercent)),
    widthPercent: Math.min(100 - leftPercent, widthPercent),
    startDate,
    dueDate,
    isVisible,
    isOutOfViewBefore: taskEnd < timelineStart,
    isOutOfViewAfter: taskStart > timelineEnd,
  };
}

/**
 * Packs tasks within a project track into non-overlapping sub-rows.
 * Uses greedy interval packing to ensure tasks never visually collide or obscure each other.
 */
export function packTasksIntoSubRows(tasks, timelineStart, timelineEnd) {
  if (!tasks || tasks.length === 0) return [];

  // 1. Calculate positions for all tasks
  const positioned = tasks.map((task) => {
    const pos = calculateTaskPosition(task, timelineStart, timelineEnd);
    return {
      ...task,
      ...pos,
    };
  });

  // 2. Sort by start date then duration
  positioned.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // 3. Assign each task to the earliest available sub-row
  const subRows = []; // each subRow is an array of tasks

  positioned.forEach((task) => {
    let placed = false;

    for (let r = 0; r < subRows.length; r++) {
      const row = subRows[r];
      const lastInRow = row[row.length - 1];

      // Check for overlap with buffer (12 hours)
      const buffer = 12 * 60 * 60 * 1000;
      if (task.startDate.getTime() >= lastInRow.dueDate.getTime() - buffer) {
        row.push(task);
        task.subRowIndex = r;
        placed = true;
        break;
      }
    }

    if (!placed) {
      task.subRowIndex = subRows.length;
      subRows.push([task]);
    }
  });

  return {
    subRows,
    subRowCount: Math.max(1, subRows.length),
    allPositionedTasks: positioned,
  };
}
