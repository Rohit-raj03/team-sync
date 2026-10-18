import React from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { Badge } from '../../../shared/components/ui/Badge.jsx';

export const MemberCard = ({ member }) => {
  return (
    <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar src={member.avatar} name={member.name} size="md" />
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">{member.name}</h4>
          <p className="text-xs text-slate-500">{member.email}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={member.status === 'Online' ? 'success' : 'default'}>
          {member.role}
        </Badge>
        <p className="text-[11px] text-slate-400 mt-1">{member.status}</p>
      </div>
    </div>
  );
};
