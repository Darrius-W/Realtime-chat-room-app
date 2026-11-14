import { useState } from 'react';
import {
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar
} from '@chatscope/chat-ui-kit-react';

// Left-hand roster: the logged in user's profile, the chat search bar, the list of
// chats, and the Add Chat / Join Group buttons
export default function ConversationSidebar({
  currentUser,
  onSignOut,
  conversations,
  notesId,
  activeId,
  onSelectChat,
  onAddChat,
  onJoinGroup
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Smart sidebar sorting engine, ensures user only see their own private notes,
  // manages chat searchbar to return the correct chat when typed, and pins most
  // important chats at the top of sidebar
  const filteredContactIds = Object.keys(conversations)
    .filter((id) => !conversations[id].isNotes || id === notesId)
    .filter((id) =>
      conversations[id].name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (conversations[b].isNotes ? 1 : 0) - (conversations[a].isNotes ? 1 : 0));

  return (
    /* LEFT PROFILE ROSTER SIDEBAR */
    <Sidebar position="left" scrollable={false}>

      <div className="sidebar-user-profile-header chat-profile-header">
        <div className="profile-main-info chat-profile-main">
          <Avatar src={currentUser.avatar} name={currentUser.name} status="available" />
          <div className="sidebar-profile-meta chat-profile-meta">
            <h4>{currentUser.name}</h4>
            <p className="chat-profile-status">Online</p>
          </div>
        </div>
        <button
          type="button"
          className="cs-demo-logout-icon-btn chat-logout-btn"
          onClick={onSignOut}
          title="Sign Out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b5278" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>

      <Search
        placeholder="Search contacts..."
        value={searchQuery}
        onChange={(val) => setSearchQuery(val)}
        onClearClick={() => setSearchQuery("")}
      />

      <ConversationList>
        {filteredContactIds.map((id) => {
          const conn = conversations[id];
          const lastMsg = conn.messages[conn.messages.length - 1]?.message || "No messages";

          let info = lastMsg;
          if (conn.state === "incoming") info = "⚠️ Wants to chat with you";
          else if (conn.state === "outgoing") info = "Request sent, waiting...";
          else if (conn.isNotes && conn.messages.length === 0) info = "Write notes to yourself";

          return (
            <Conversation
              key={conn.id}
              name={conn.name}
              info={info}
              active={activeId === conn.id}
              unreadCnt={conn.unread > 0 ? conn.unread : undefined}
              onClick={() => onSelectChat(conn.id)}
            >
              <Avatar src={conn.avatar} name={conn.name} status={conn.state === "incoming" ? "away" : conn.status} />
            </Conversation>
          );
        })}
      </ConversationList>

      <div className="sidebar-footer-action-row chat-sidebar-footer">
        <button type="button" className="footer-action-btn chat-footer-btn" onClick={onAddChat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
          </svg>
          <span>Add Chat</span>
        </button>
        <button type="button" className="footer-action-btn chat-footer-btn" onClick={onJoinGroup}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Join Group</span>
        </button>
      </div>

    </Sidebar>
  );
}