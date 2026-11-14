import { useState, useEffect, useRef } from 'react';
import { MainContainer } from '@chatscope/chat-ui-kit-react';
import './Chatroom.css';
import { getCurrentTimeStr, makePrivateId, systemMessage, makeConversation } from './conversationUtils';
import usePersonalNotes from './usePersonalNotes';
import useChatSocket, { socket } from './useChatSocket';
import ConversationSidebar from './ConversationSidebar';
import ChatPane from './ChatPane';

export default function Chatroom({ currentUser, onSignOut }) {
  const [conversations, setConversations] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileView, setMobileView] = useState("sidebar");

  // Stores current active room id to avoid reloading errors when switching chats
  const activeIdRef = useRef(null);
  const joinedGroupsRef = useRef(new Set());

  useEffect(() => {
    activeIdRef.current = activeId;
    setIsTyping(false);
  }, [activeId]);

  // Personal notes chat: created on login and saved in the browser
  const notesId = usePersonalNotes(currentUser, conversations, setConversations);

  // Live connection to the backend: turns server events into chat state updates
  useChatSocket({
    currentUser,
    setConversations,
    setActiveId,
    setMobileView,
    setIsTyping,
    activeIdRef,
    joinedGroupsRef
  });

  const activeChat = conversations[activeId];

  // ---------- handlers ----------

  // Opens a chat picked from the sidebar, clears its unread counter,
  // and switches to the chat view on mobile
  const handleSelectChat = (id) => {
    setActiveId(id);
    setConversations((prev) => ({ ...prev, [id]: { ...prev[id], unread: 0 } }));
    setMobileView("chat");
  };

  // Manages the add chat event, providing an input box for the username,
  // performing checks to verify conflicts with current chats, and firing
  // the invitation request over the server socket
  const handleAddChat = () => {
    const name = prompt("Enter contact name:");
    if (!name || !name.trim()) return;
    const cleanName = name.trim();

    if (cleanName.toLowerCase() === currentUser.name.toLowerCase()) {
      setActiveId(notesId);
      setMobileView("chat");
      return;
    }

    const roomId = makePrivateId(currentUser.name, cleanName);
    if (conversations[roomId]) {
      setActiveId(roomId);
      setMobileView("chat");
      return;
    }

    // The server tracks the request and notifies the other user
    socket.emit('chat_request', { from: currentUser.name, to: cleanName });
  };

  // Handles the invitation receiver decision to accept or decline chat,
  // when accept fires off a network control packet to initiate room setup,
  // if declined, cleans up any pending windows
  const handleRespond = (accept) => {
    if (!activeId) return;
    socket.emit('chat_response', {
      room: activeId,
      userName: currentUser.name,
      accept
    });
  };

  // Handles the join group event, constructs a standardized room ID,
  // stores it in a local cache for session recovery on reconnect,
  // and tells the server to route your text streams while the frontend builds the room
  const handleJoinGroup = () => {
    const groupName = prompt("Enter Group Chat name:");
    if (!groupName || !groupName.trim()) return;
    const cleanGroupName = groupName.trim();
    const groupRoomId = `group_${cleanGroupName.toLowerCase().replace(/\s+/g, '_')}`;

    if (conversations[groupRoomId]) {
      setActiveId(groupRoomId);
      setMobileView("chat");
      return;
    }

    joinedGroupsRef.current.add(groupRoomId);
    socket.emit('join', { userName: currentUser.name, room: groupRoomId });

    setConversations((prev) => ({
      ...prev,
      [groupRoomId]: makeConversation({
        id: groupRoomId,
        name: cleanGroupName,
        info: "Group Chat Rooms",
        isGroup: true,
        messages: [systemMessage(`Joined the channel group "${cleanGroupName}". Welcome!`)]
      })
    }));
    setActiveId(groupRoomId);
    setMobileView("chat");
  };

  // Smart text router, identifies whether message is being sent to personal notes
  // or a chat to another user, manages the network gate to open when chatting over
  // the network or closing if personal note to avoid network leaks
  const handleSend = (htmlText, plainText) => {
    if (!plainText.trim() || !activeId || activeChat?.state !== "active") return;

    // Notes never leave this browser
    if (activeChat.isNotes) {
      const note = {
        message: plainText,
        direction: "outgoing",
        sender: currentUser.name,
        sentTime: getCurrentTimeStr()
      };
      setConversations((prev) => {
        const conv = prev[activeId];
        if (!conv) return prev;
        return { ...prev, [activeId]: { ...conv, messages: [...conv.messages, note] } };
      });
      return;
    }

    socket.emit('message', {
      room: activeId,
      currMsg: plainText,
      userName: currentUser.name
    });

    socket.emit('typing', { room: activeId, username: currentUser.name, isTyping: false });
  };

  // Handles typing events when chatting with another user, actively listens
  // to keystrokes to dynamically show the typing indicator animation
  const handleTypingIndicator = (val) => {
    if (!activeId || activeChat?.state !== "active" || activeChat.isNotes) return;
    socket.emit('typing', {
      room: activeId,
      username: currentUser.name,
      isTyping: val.trim().length > 0
    });
  };

  // ---------- render ----------

  return (
    <div className={`app-dashboard-wrapper ${mobileView === "sidebar" ? "show-sidebar" : "show-chat"}`}>
      <MainContainer responsive>

        <ConversationSidebar
          currentUser={currentUser}
          onSignOut={onSignOut}
          conversations={conversations}
          notesId={notesId}
          activeId={activeId}
          onSelectChat={handleSelectChat}
          onAddChat={handleAddChat}
          onJoinGroup={handleJoinGroup}
        />

        <ChatPane
          activeChat={activeChat}
          currentUser={currentUser}
          isTyping={isTyping}
          onBack={() => setMobileView("sidebar")}
          onRespond={handleRespond}
          onSend={handleSend}
          onTyping={handleTypingIndicator}
        />

      </MainContainer>
    </div>
  );
}