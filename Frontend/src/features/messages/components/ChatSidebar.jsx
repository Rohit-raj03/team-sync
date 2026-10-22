import React, { useState } from 'react';
import { Search, Hash, Plus, Circle, Users } from 'lucide-react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { useTeam } from '../../team/hooks/useTeam.js';

/**
 * Feature Component: ChatSidebar
 * Layer: features/messages/components/
 * Responsibility: Channel and live team member contact list with search and status badges.
 */
export const ChatSidebar = ({ activeChat, onSelectChat }) => {
  const [search, setSearch] = useState('');
  const { members = [] } = useTeam();

  const channels = [
    { id: 'c-1', name: 'general', unread: 0 },
    { id: 'c-2', name: 'project-announcements', unread: 0 },
    { id: 'c-3', name: 'dev-team', unread: 0 },
  ];

  const filteredMembers = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full md:w-80 bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-2xs">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-3">Messages</h3>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F4F7FE] text-xs font-medium rounded-full border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Chat Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Channels Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Channels</span>
          </div>
          <div className="space-y-0.5">
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectChat({ type: 'channel', ...c })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeChat?.id === c.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash size={15} className="text-slate-400" />
                  <span>{c.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Live Team Members Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Team Members ({filteredMembers.length})</span>
          </div>
          <div className="space-y-1">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => {
                const memberId = member.id || member._id;
                const isSelected = activeChat?.id === memberId;
                return (
                  <button
                    key={memberId}
                    onClick={() =>
                      onSelectChat({
                        type: 'dm',
                        id: memberId,
                        name: member.name,
                        role: member.role || 'Member',
                        avatar: member.avatar,
                        status: member.status || 'online',
                      })
                    }
                    className={`w-full flex items-start gap-3 p-2.5 rounded-2xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border border-indigo-100 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <Avatar src={member.avatar} name={member.name} size="sm" />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                          member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{member.name}</h5>
                        <span className="text-[10px] text-slate-400">{member.role}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{member.email}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                No team members found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
