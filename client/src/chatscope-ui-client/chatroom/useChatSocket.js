import { useEffect } from 'react';
import io from 'socket.io-client';
import { getCurrentTimeStr, systemMessage, makeConversation } from './conversationUtils';

// Backend path placeholder, telling frontend where it can access/place server related data
export const socket = io("http://127.0.0.1:5000", { autoConnect: false });

// Owns the live connection to the backend: registers every socket listener,
// turns server events into chat state updates, and cleans up when the user leaves.
export default function useChatSocket({
  currentUser,
  setConversations,
  setActiveId,
  setMobileView,
  setIsTyping,
  activeIdRef,
  joinedGroupsRef
}) {
  // Ensure user is reloaded in all their chatrooms upon re-login
  useEffect(() => {
    const me = currentUser.name.toLowerCase();

    const joinRooms = () => {
      // Personal room: used for chat requests and private message delivery
      socket.emit('join', { userName: currentUser.name, room: me });
      // Group rooms are lost on reconnect, so rejoin them
      joinedGroupsRef.current.forEach((room) =>
        socket.emit('join', { userName: currentUser.name, room })
      );
    };

    const onReceivedMessage = ({ room, message, sender }) => {
      // Evaluates the message sender to mark the chat bubble and style it as outgoing or incoming chat
      const direction = sender.toLowerCase() === me ? "outgoing" : "incoming";
      setConversations((prev) => {
        // Routes incoming text messages to the right rooms
        const conv = prev[room];
        if (!conv) return prev;
        // Checks if message was sent to active chat, if not it increments the unread
        // notification counter to keep user aware of unread messages in inactive chatrooms
        const isUnread = direction === "incoming" && activeIdRef.current !== room;
        return {
          ...prev,
          [room]: {
            ...conv,
            unread: isUnread ? conv.unread + 1 : conv.unread,
            messages: [...conv.messages, { message, direction, sender, sentTime: getCurrentTimeStr() }]
          }
        };
      });
    };

    // Handle new chat creation, routing chat invitations to your inbox, building new
    // chatrooms through makeConversation, and sending the invitation message to your inbox
    const onRequestReceived = ({ room, from }) => {
      const nothingOpen = activeIdRef.current === null;
      if (nothingOpen) {
        setActiveId(room);
        setMobileView("chat");
      }
      setConversations((prev) => {
        if (prev[room]) return prev;
        return {
          ...prev,
          [room]: makeConversation({
            id: room,
            name: from,
            info: "Chat request",
            state: "incoming",
            unread: nothingOpen ? 0 : 1,
            messages: [systemMessage(`${from} wants to start a chat with you.`)]
          })
        };
      });
    };

    // Manages the chat invitation of the sender, creating a chatroom that is pending
    // on receiver to accept connection
    const onRequestSent = ({ room, to }) => {
      setConversations((prev) => {
        if (prev[room]) return prev;
        return {
          ...prev,
          [room]: makeConversation({
            id: room,
            name: to,
            info: "Request sent",
            state: "outgoing",
            messages: [systemMessage(`Request sent to ${to}. Waiting for them to accept...`)]
          })
        };
      });
      setActiveId(room);
      setMobileView("chat");
    };

    // Handles accepted connection, completely removing pending chat lock and
    // initiating a room to connect the users for a chat
    const onAccepted = ({ room, users }) => {
      const partner = users.find((u) => u.toLowerCase() !== me) || "user";
      setConversations((prev) => {
        const conv = prev[room];
        if (!conv) {
          return {
            ...prev,
            [room]: makeConversation({
              id: room,
              name: partner,
              state: "active",
              messages: [systemMessage("Chat accepted. Say hello!")]
            })
          };
        }
        if (conv.state === "active") return prev;
        return {
          ...prev,
          [room]: {
            ...conv,
            state: "active",
            info: "Private Conversation",
            messages: [...conv.messages, systemMessage("Chat accepted. Say hello!")]
          }
        };
      });
    };

    // Manages the cleanup of a declined request to chat, safely removing
    // the card from each user's sidebar
    const onDeclined = ({ room, by }) => {
      setConversations((prev) => {
        if (!prev[room]) return prev;
        const next = { ...prev };
        delete next[room];
        return next;
      });
      if (activeIdRef.current === room) {
        setActiveId(null);
        setMobileView("sidebar");
      }
      if (by.toLowerCase() !== me) {
        alert(`${by} declined your chat request.`);
      }
    };

    // Temporarily acts as persistence storage for chats and saves incoming
    // requests/messages to load them when logging back in
    const onSync = ({ incoming = [], outgoing = [], active = [] }) => {
      setConversations((prev) => {
        const next = { ...prev };
        incoming.forEach(({ room, partner }) => {
          if (next[room]) return;
          next[room] = makeConversation({
            id: room,
            name: partner,
            info: "Chat request",
            state: "incoming",
            unread: 1,
            messages: [systemMessage(`${partner} wants to start a chat with you.`)]
          });
        });
        outgoing.forEach(({ room, partner }) => {
          if (next[room]) return;
          next[room] = makeConversation({
            id: room,
            name: partner,
            info: "Request sent",
            state: "outgoing",
            messages: [systemMessage(`Request sent to ${partner}. Waiting for them to accept...`)]
          });
        });
        active.forEach(({ room, partner }) => {
          if (next[room]) return;
          next[room] = makeConversation({ id: room, name: partner, state: "active" });
        });
        return next;
      });
    };

    // Acts as a standard catch-all for errors that may occur during
    // the chatroom process, displaying a basic alert to the user
    const onError = ({ message }) => alert(message);

    // Dynamically notifies the receiver that the peer user is actively typing a message to them
    const onTyping = ({ room, username, isTyping: typing }) => {
      if (room === activeIdRef.current && username.toLowerCase() !== me) {
        setIsTyping(typing);
      }
    };

    // Maps incoming real-time backend socket events to their corresponding
    // frontend functions to ensure data synchronicity
    socket.on('connect', joinRooms);
    socket.on('received_message', onReceivedMessage);
    socket.on('chat_request_received', onRequestReceived);
    socket.on('chat_request_sent', onRequestSent);
    socket.on('chat_accepted', onAccepted);
    socket.on('chat_declined', onDeclined);
    socket.on('sync_chats', onSync);
    socket.on('chat_error', onError);
    socket.on('updateTyping', onTyping);

    // Switches on the live socket connection, allowing the frontend
    // to communicate with the backend in real time
    if (socket.connected) joinRooms();
    else socket.connect();

    // Network clean-up, cleanly closes all socket listeners to avoid any memory leaks
    return () => {
      socket.off('connect', joinRooms);
      socket.off('received_message', onReceivedMessage);
      socket.off('chat_request_received', onRequestReceived);
      socket.off('chat_request_sent', onRequestSent);
      socket.off('chat_accepted', onAccepted);
      socket.off('chat_declined', onDeclined);
      socket.off('sync_chats', onSync);
      socket.off('chat_error', onError);
      socket.off('updateTyping', onTyping);
      socket.disconnect();
    };
  }, [currentUser.name, setConversations, setActiveId, setMobileView, setIsTyping, activeIdRef, joinedGroupsRef]);
}
