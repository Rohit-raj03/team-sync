import React, { useState, useMemo } from 'react';
import { Search, Clock } from 'lucide-react';


/**
 * Feature Component: AdminActivityLogs
 * Layer: features/admin/components/
 * Responsibility: Chronological audit feed displaying system actions, user activities, and security events.
 */
export const AdminActivityLogs = ({ logs = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.resource.toLowerCase().includes(q);

      const matchesCat =
        categoryFilter === 'ALL' || log.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [logs, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">System Activity Logs</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Immutable audit record of all project, task, user, and security modifications.
        </p>
      </div>

      {/* Toolbar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-100/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or target..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {['ALL', 'Projects', 'Tasks', 'Users', 'Teams', 'Security'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? 'All Activities' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-3xl border border-slate-100/90 shadow-sm p-6">
        {filteredLogs.length > 0 ? (
          <div className="relative border-l-2 border-slate-100 ml-4 space-y-6">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                {/* Timeline node dot */}
                <div className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-primary group-hover:scale-115 transition-transform" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={log.avatar}
                      alt={log.user}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-100 shrink-0"
                    />

                    <div className="text-xs">
                      <p className="text-slate-800 font-medium">
                        <span className="font-bold text-slate-900">{log.user}</span>{' '}
                        <span className="text-slate-600">{log.action}</span>{' '}
                        <span className="font-semibold text-primary">
                          "{log.resource}"
                        </span>
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {log.timestamp}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 self-start sm:self-auto shrink-0">
                    {log.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity logs match your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

