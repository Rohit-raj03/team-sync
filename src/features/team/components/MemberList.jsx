import React from 'react';
import { MemberCard } from './MemberCard.jsx';

export const MemberList = ({ members = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <MemberCard key={m.id} member={m} />
      ))}
    </div>
  );
};
