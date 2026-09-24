import React from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';

export const ProjectMembers = ({ members = [] }) => {
  return (
    <div className="flex -space-x-2">
      {members.map((m, idx) => (
        <Avatar key={idx} name={m.name} size="sm" className="border-2 border-white" />
      ))}
    </div>
  );
};
