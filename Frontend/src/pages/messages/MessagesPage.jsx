import React, { useState } from 'react';
import { ChatSidebar } from '../../features/messages/components/ChatSidebar.jsx';
import { ChatWindow } from '../../features/messages/components/ChatWindow.jsx';
import { ChatUserProfile } from '../../features/messages/components/ChatUserProfile.jsx';

/**
 * Presentation Layer: MessagesPage (Screen 6 from Figma)
 * Layer: pages/messages/
 * Responsibility: Assembles the team communication hub including chat channels, conversation thread, and participant inspector.
 */
export const MessagesPage = () => {
  const [activeChat, setActiveChat] = useState({
    id: 'dm-1',
    name: 'Sarah Chen',
    role: 'UI Designer',
    status: 'online',
  });
  const [showProfile, setShowProfile] = useState(true);
  const [isMobileThreadView, setIsMobileThreadView] = useState(false);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    setIsMobileThreadView(true);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-6 overflow-hidden max-w-7xl mx-auto">
      {/* 1. Chat Channels & Direct Messages Sidebar */}
      <div
        className={`w-full md:w-auto h-full ${
          isMobileThreadView ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatSidebar activeChat={activeChat} onSelectChat={handleSelectChat} />
      </div>

      {/* 2. Main Active Chat Window */}
      <div
        className={`w-full flex-1 h-full ${
          isMobileThreadView ? 'flex flex-col' : 'hidden md:flex md:flex-col'
        }`}
      >
        <ChatWindow
          activeChat={activeChat}
          onToggleProfile={() => setShowProfile((prev) => !prev)}
          onBack={() => setIsMobileThreadView(false)}
        />
      </div>

      {/* 3. Participant Details (Desktop Side-by-Side Panel) */}
      {showProfile && (
        <div className="hidden xl:block">
          <ChatUserProfile
            user={activeChat}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}

      {/* 4. Participant Details Drawer (Mobile & Tablet Slide-Over) */}
      {showProfile && (
        <div
          className="xl:hidden fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="h-full w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <ChatUserProfile
              user={activeChat}
              onClose={() => setShowProfile(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

