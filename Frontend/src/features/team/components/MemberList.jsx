import React from "react";
import { MemberCard } from "./MemberCard.jsx";

export const MemberList = ({ members = [] }) => {
  if (members.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-xs font-medium text-slate-500">
          No team members registered yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((m) => (
        <MemberCard key={m.id || m._id} member={m} />
      ))}
    </div>
  );
};
