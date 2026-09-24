import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';

export const ProjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Create Project</Button>
      </div>
    </form>
  );
};
