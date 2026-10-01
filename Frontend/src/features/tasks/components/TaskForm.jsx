import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

export const TaskForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      status: TASK_STATUS.TODO,
      priority: TASK_PRIORITY.MEDIUM,
      dueDate: new Date().toISOString().split('T')[0],
      assignedTo: 'Alex Johnson',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            {Object.values(TASK_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            {Object.values(TASK_PRIORITY).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Due Date"
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Task
        </Button>
      </div>
    </form>
  );
};
