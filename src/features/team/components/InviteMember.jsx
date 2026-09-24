import React, { useState } from 'react';
import { Input } from '../../../shared/components/ui/Input.jsx';
import { Button } from '../../../shared/components/ui/Button.jsx';

export const InviteMember = ({ onInvite, onCancel }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Team Member');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    onInvite({ email, name: email.split('@')[0], role });
    setEmail('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Member Email"
        type="email"
        placeholder="colleague@teamsync.io"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
          Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="Team Member">Team Member</option>
          <option value="Product Lead">Product Lead</option>
          <option value="Developer">Developer</option>
          <option value="Designer">Designer</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-3">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Send Invite</Button>
      </div>
    </form>
  );
};
