import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import multiavatar from '@multiavatar/multiavatar';
import {
  MainContainer,
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  InfoButton
} from '@chatscope/chat-ui-kit-react';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

// Helper function that matches your Login.jsx to generate offline data strings instantly
const getOfflineAvatar = (name) => {
  const rawSvgCode = multiavatar(name.trim());
  return `data:image/svg+xml;utf8,${encodeURIComponent(rawSvgCode)}`;
};

const INITIAL_CONVERSATIONS = {
  1: {
    id: 1,
    name: "Zoe",
    avatar: getOfflineAvatar("Zoe"), // Generates local data string instantly
    status: "available",
    info: "Software Engineer",
    unread: 2,
    isGroup: false,
    messages: [
      { message: "Hey there! Did you finish checking that repository code?", direction: "incoming", sender: "Zoe", sentTime: "10:14 AM" },
      { message: "Perfect, everything layout-wise fits edge-to-edge beautifully!", direction: "outgoing", sender: "You", sentTime: "10:15 AM" }
    ]
  },
  2: {
    id: 2,
    name: "Lilly",
    avatar: getOfflineAvatar("Lilly"), // Generates local data string instantly
    status: "away",
    info: "UI/UX Designer",
    unread: 0,
    isGroup: false,
    messages: [
      { message: "Hi! Can you audit the component responsive media targets?", direction: "incoming", sender: "Lilly", sentTime: "Yesterday" }
    ]
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState("sidebar"); 
  
  // Authentication route coordinator state ('login' | 'signup')
  const [authScreen, setAuthScreen] = useState("login");

  const activeChat = conversations[activeId];
  const filteredContactIds = Object.keys(conversations).filter(id => 
    conversations[id].name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthScreen("login");
    setMobileView("sidebar");
    setConversations(INITIAL_CONVERSATIONS); 
  };

  const getCurrentTimeStr = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAddChat = () => {
    const name = prompt("Enter contact name:");
    if (!name || !name.trim()) return;

    const newId = Date.now();
    setConversations(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        name: name.trim(),
        avatar: getOfflineAvatar(name.trim()), // Local offline avatar string generation
        status: "available",
        info: "New Friend",
        unread: 0,
        isGroup: false,
        messages: [{ message: "Started a new conversation thread.", direction: "incoming", sender: name, sentTime: getCurrentTimeStr() }]
      }
    }));
    setActiveId(newId);
    setMobileView("chat");
  };

  const handleJoinGroup = () => {
    const groupName = prompt("Enter Group Chat name:");
    if (!groupName || !groupName.trim()) return;

    const newId = Date.now();
    setConversations(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        name: groupName.trim(),
        avatar: getOfflineAvatar(groupName.trim()), // Local offline avatar string generation
        status: "available",
        info: "Group Chat Rooms",
        unread: 0,
        isGroup: true,
        messages: [{ message: `Joined the channel group "${groupName}". Welcome!`, direction: "incoming", sender: "System", sentTime: getCurrentTimeStr() }]
      }
    }));
    setActiveId(newId);
    setMobileView("chat");
  };

  const handleSend = (htmlText, plainText) => {
    if (!plainText.trim()) return;

    const userMessage = { 
      message: plainText, 
      direction: "outgoing", 
      sender: currentUser.name,
      sentTime: getCurrentTimeStr()
    };

    setConversations(prev => ({
      ...prev,
      [activeId]: { ...prev[activeId], messages: [...prev[activeId].messages, userMessage] }
    }));

    setIsTyping(true);
    setTimeout(() => {
      const responseSender = activeChat.isGroup ? "Channel Member" : activeChat.name;
      const botMessage = {
        message: `Hello ${currentUser.name}! Message parsed within ${activeChat.name}.`,
        direction: "incoming",
        sender: responseSender,
        sentTime: getCurrentTimeStr()
      };
      setConversations(prev => ({
        ...prev,
        [activeId]: { ...prev[activeId], messages: [...prev[activeId].messages, botMessage] }
      }));
      setIsTyping(false);
    }, 1100);
  };

  // ==========================================================================
  // SEGREGATED AUTH SCREEN ROUTING STACK
  // ==========================================================================
  if (!currentUser) {
    if (authScreen === "signup") {
      return (
        <Signup 
          onSignup={(userData) => setCurrentUser(userData)} 
          onSwitchToLogin={() => setAuthScreen("login")} 
        />
      );
    }
    return (
      <Login 
        onLogin={(userData) => setCurrentUser(userData)} 
        onSwitchToSignup={() => setAuthScreen("signup")} 
      />
    );
  }
  // ==========================================================================
  // CORE CHAT APPLICATION UI VIEW
  // ==========================================================================
  return (
    <div className={`app-dashboard-wrapper ${mobileView === "sidebar" ? "show-sidebar" : "show-chat"}`}>
      <MainContainer responsive>
        
        {/* LEFT PROFILE ROSTER SIDEBAR */}
        <Sidebar position="left" scrollable={false}>
          
          <div className="sidebar-user-profile-header">
            <div className="profile-main-info">
              <Avatar src={currentUser.avatar} name={currentUser.name} status="available" />
              <div className="sidebar-profile-meta">
                <h4>{currentUser.name}</h4>
                <p>Online</p>
              </div>
            </div>
            <button 
              type="button" 
              className="cs-demo-logout-icon-btn" 
              onClick={handleSignOut}
              title="Sign Out"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b5278" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* ORIGINAL LOOK: Isolated search bar to retain pristine width styling scales */}
          <Search 
            placeholder="Search contacts..." 
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
            onClearClick={() => setSearchQuery("")}
          />
          
          <ConversationList>
            {filteredContactIds.map(id => {
              const conn = conversations[id];
              const lastMsg = conn.messages[conn.messages.length - 1]?.message || "No messages";
              
              return (
                <Conversation 
                  key={conn.id} 
                  name={conn.name} 
                  info={lastMsg}
                  active={activeId === conn.id}
                  unreadCnt={conn.unread > 0 ? conn.unread : undefined}
                  onClick={() => {
                    setActiveId(conn.id);
                    setConversations(prev => ({ ...prev, [id]: { ...prev[id], unread: 0 } }));
                    setMobileView("chat"); 
                  }}
                >
                  <Avatar src={conn.avatar} name={conn.name} status={conn.status} />
                </Conversation>
              );
            })}
          </ConversationList>

          <div className="sidebar-footer-action-row">
            <button type="button" className="footer-action-btn" onClick={handleAddChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              <span>Add Chat</span>
            </button>
            <button type="button" className="footer-action-btn" onClick={handleJoinGroup}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Join Group</span>
            </button>
          </div>

        </Sidebar>

        {/* RIGHT ACTIVE MESSAGING VIEW PANEL */}
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back onClick={() => setMobileView("sidebar")} />
            <Avatar src={activeChat.avatar} name={activeChat.name} />
            <ConversationHeader.Content userName={activeChat.name} info={activeChat.info} />
            
            <ConversationHeader.Actions>
              <InfoButton />
            </ConversationHeader.Actions>
          </ConversationHeader>

          <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${activeChat.name} is updating...`} /> : null}>
            {activeChat.messages.map((msg, index) => (
              <Message
                key={index}
                model={{
                  message: msg.message,
                  direction: msg.direction,
                  sender: msg.sender,
                  position: "single"
                }}
              >
                <Message.Header 
                  sender={msg.direction === "outgoing" ? "You" : msg.sender} 
                  sentTime={msg.sentTime} 
                />
                {msg.direction === "incoming" && <Avatar src={activeChat.avatar} name={activeChat.name} size="sm" />}
              </Message>
            ))}
          </MessageList>

          <MessageInput 
            placeholder="Type message here..." 
            onSend={handleSend} 
            attachButton={true} 
          />
        </ChatContainer>

      </MainContainer>
    </div>
  );
}
