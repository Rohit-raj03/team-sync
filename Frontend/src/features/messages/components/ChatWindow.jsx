import React, { useState } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, FileText, ExternalLink } from 'lucide-react';
import { Avatar } from '../../../shared/components/ui/Avatar.jsx';

/**
 * Feature Component: ChatWindow
 * Layer: features/messages/components/
 * Responsibility: Active conversation stream with message bubbles, image/file previews, and input controls matching Figma Screen 6.
 */
export const ChatWindow = ({ activeChat, onToggleProfile }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Sarah Chen',
      text: 'Hey Alex! I just finalized the interactive navigation and Gantt schedule components in the Figma workspace.',
      time: '12:38 pm',
      isMe: false,
    },
    {
      id: '2',
      sender: 'Sarah Chen',
      text: 'Take a look at the export below and let me know if the color tokens align with our Tailwind setup.',
      time: '12:39 pm',
      isMe: false,
      attachment: {
        title: 'TeamSync_Design_System_v2.fig',
        type: 'Figma File',
        size: '18.4 MB',
      },
    },
    {
      id: '3',
      sender: 'Alex Johnson',
      text: 'This looks fantastic Sarah! The dual-spline area chart and status pills match the design perfectly. I will integrate them now.',
      time: '12:42 pm',
      isMe: true,
    },
  ]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'Alex Johnson',
        text: inputText,
        time: 'Just now',
        isMe: true,
      },
    ]);
    setInputText('');
  };

  const title = activeChat?.name || 'Sarah Chen';
  const subtitle = activeChat?.role || (activeChat?.type === 'channel' ? 'Public Channel' : 'Active Now');

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-100 flex flex-col h-full overflow-hidden shadow-2xs">
      {/* Chat Top Header */}
      <div className="h-18 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <Avatar name={title} size="md" />
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-tight">{title}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-400">{subtitle}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <button className="p-2 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors" title="Voice Call">
            <Phone size={17} />
          </button>
          <button className="p-2 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors" title="Video Meeting">
            <Video size={17} />
          </button>
          <button
            onClick={onToggleProfile}
            className="p-2 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Chat Details"
          >
            <MoreVertical size={17} />
          </button>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFBFD]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-lg ${m.isMe ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {!m.isMe && <Avatar name={m.sender} size="sm" className="shrink-0 mt-1" />}

            <div className={`space-y-1.5 ${m.isMe ? 'items-end text-right' : ''}`}>
              <div
                className={`p-4 rounded-3xl text-xs leading-relaxed ${
                  m.isMe
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-100 rounded-bl-xs shadow-2xs'
                }`}
              >
                <p>{m.text}</p>

                {/* Attachment Card Preview */}
                {m.attachment && (
                  <div className="mt-3 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between gap-3 text-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <FileText size={16} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-xs truncate max-w-44">{m.attachment.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{m.attachment.size}</span>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg text-indigo-600 hover:bg-white transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-400 block px-1">{m.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <button
          type="button"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Attach file"
        >
          <Paperclip size={18} />
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#F4F7FE] text-slate-800 text-xs font-medium rounded-full border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <Smile size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

