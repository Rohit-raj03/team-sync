import { useState } from 'react';

const mockMembers = [
  { id: 'm-1', name: 'Alex Johnson', email: 'alex@teamsync.io', role: 'Project Lead', status: 'Online' },
  { id: 'm-2', name: 'Sarah Chen', email: 'sarah@teamsync.io', role: 'UI/UX Designer', status: 'In a meeting' },
  { id: 'm-3', name: 'David Kim', email: 'david@teamsync.io', role: 'Backend Engineer', status: 'Offline' },
];

export function useTeam() {
  const [members, setMembers] = useState(mockMembers);

  const inviteMember = (data) => {
    setMembers((prev) => [...prev, { ...data, id: `m-${Date.now()}`, status: 'Invited' }]);
  };

  return { members, inviteMember };
}
