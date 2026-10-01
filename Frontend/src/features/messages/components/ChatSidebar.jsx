import React, { useState } from 'react';
import { Search, Hash, Plus, Circle } from 'lucide-react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';

/**
 * Feature Component: ChatSidebar
 * Layer: features/messages/components/
 * Responsibility: Channel and direct message contact list with search and unread badges matching Figma Screen 6.
 */
export const ChatSidebar = ({ activeChat, onSelectChat }) => {
  const [search, setSearch] = useState('');

  const channels = [
    { id: 'c-1', name: 'general', unread: 0 },
    { id: 'c-2', name: 'design-system', unread: 3 },
    { id: 'c-3', name: 'dev-sprints', unread: 1 },
    { id: 'c-4', name: 'announcements', unread: 0 },
  ];

  const directMessages = [
    {
      id: 'dm-1',
      name: 'Sarah Chen',
      role: 'UI Designer',
      status: 'online',
      lastMessage: 'I updated the Figma navigation component!',
      time: '12:45 pm',
      unread: 2,
    },
    {
      id: 'dm-2',
      name: 'David Kim',
      role: 'Backend Engineer',
      status: 'online',
      lastMessage: 'The API endpoints are ready for integration.',
      time: '11:20 am',
      unread: 0,
    },
    {
      id: 'dm-3',
      name: 'Elena Rostova',
      role: 'Product Lead',
      status: 'in-meeting',
      lastMessage: 'Can you review the sprint backlog when free?',
      time: 'Yesterday',
      unread: 0,
    },
    {
      id: 'dm-4',
      name: 'Marcus Brody',
      role: 'QA Engineer',
      status: 'offline',
      lastMessage: 'All test assertions passed on build #104.',
      time: '2d ago',
      unread: 0,
    },
  ];

  return (
    <div className="w-full md:w-80 bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-2xs">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-3">Messages</h3>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
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
            <button className="hover:text-indigo-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-0.5">
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectChat({ type: 'channel', ...c })}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
                  activeChat?.id === c.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash size={15} className="text-slate-400" />
                  <span>{c.name}</span>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Direct Messages</span>
            <button className="hover:text-indigo-600 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {directMessages.map((dm) => (
              <button
                key={dm.id}
                onClick={() => onSelectChat({ type: 'dm', ...dm })}
                className={`w-full flex items-start gap-3 p-2.5 rounded-2xl transition-all text-left ${
                  activeChat?.id === dm.id
                    ? 'bg-indigo-50/70 border border-indigo-100 shadow-2xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="relative shrink-0 mt-0.5">
                  <Avatar name={dm.name} size="sm" />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                      dm.status === 'online'
                        ? 'bg-emerald-500'
                        : dm.status === 'in-meeting'
                        ? 'bg-amber-400'
                        : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-slate-900 truncate">{dm.name}</h5>
                    <span className="text-[10px] text-slate-400">{dm.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{dm.lastMessage}</p>
                </div>
                {dm.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 self-center">
                    {dm.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;

