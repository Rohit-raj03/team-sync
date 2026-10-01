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

  return (
    <div className="h-[calc(100vh-8.5rem)] flex gap-6 overflow-hidden max-w-7xl mx-auto">
      {/* 1. Chat Channels & Direct Messages Sidebar */}
      <div className="hidden md:block">
        <ChatSidebar activeChat={activeChat} onSelectChat={setActiveChat} />
      </div>

      {/* 2. Main Active Chat Window */}
      <ChatWindow
        activeChat={activeChat}
        onToggleProfile={() => setShowProfile((prev) => !prev)}
      />

      {/* 3. Participant Details (Collapsible on smaller displays) */}
      {showProfile && (
        <div className="hidden xl:block">
          <ChatUserProfile
            user={activeChat}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

