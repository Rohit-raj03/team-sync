import React from 'react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';
import { Mail, Clock, FileText, Bell, X } from 'lucide-react';

/**
 * Feature Component: ChatUserProfile
 * Layer: features/messages/components/
 * Responsibility: Participant details panel showing user profile, shared media, and files matching Figma Screen 6.
 */
export const ChatUserProfile = ({ user, onClose }) => {
  const current = user || {
    name: 'Sarah Chen',
    role: 'Lead UI/UX Designer',
    email: 'sarah.chen@teamsync.io',
    timezone: 'GMT+5:30 (Local Time)',
    status: 'online',
  };

  const sharedFiles = [
    { name: 'OCTOM_UI_Design_Tokens.json', size: '24 KB' },
    { name: 'Sprint_24_Wireframes.pdf', size: '4.2 MB' },
    { name: 'Avatar_Assets.zip', size: '12.8 MB' },
  ];

  return (
    <div className="w-80 bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-y-auto p-6 shadow-2xs relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close user profile"
        >
          <X size={16} />
        </button>
      )}
      {/* Profile Header */}
      <div className="text-center pb-6 border-b border-slate-100">
        <div className="relative inline-block mb-3">
          <Avatar name={current.name} size="lg" className="w-20 h-20 text-xl mx-auto shadow-md" />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-white" />
        </div>
        <h4 className="font-bold text-base text-slate-900">{current.name}</h4>
        <p className="text-xs font-medium text-slate-400 mt-0.5">{current.role}</p>
      </div>

      {/* Contact Info */}
      <div className="py-5 border-b border-slate-100 space-y-3">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <Mail size={16} className="text-slate-400" />
          <span className="truncate">{current.email}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <Clock size={16} className="text-slate-400" />
          <span>{current.timezone}</span>
        </div>
      </div>

      {/* Shared Files & Assets */}
      <div className="py-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Shared Files</span>
          <button className="text-[11px] font-semibold text-indigo-600 hover:underline">See All</button>
        </div>
        <div className="space-y-2">
          {sharedFiles.map((f, idx) => (
            <div
              key={f.id || f._id || f.name || idx}
              className="p-2.5 rounded-2xl bg-[#F8FAFC] hover:bg-slate-100/60 border border-slate-100 flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText size={15} className="text-indigo-600 shrink-0" />
                <span className="truncate text-slate-700 font-medium">{f.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold shrink-0 pl-2">{f.size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-slate-400" />
          <span className="font-semibold">Mute Notifications</span>
        </div>
        <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
      </div>
    </div>
  );
};

export default ChatUserProfile;

