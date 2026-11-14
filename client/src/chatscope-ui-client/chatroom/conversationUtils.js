// Small shared builders used across the chatroom: avatars, timestamps, room ids,
// system announcements, and the template every chat is created from
import multiavatar from '@multiavatar/multiavatar';

// Generates a user avatar for logged in user based on user name using multiavatar api
export const getOfflineAvatar = (name) => {
  const safeName = String(name || "?").trim() || "?";
  return `data:image/svg+xml;utf8,${encodeURIComponent(multiavatar(safeName))}`;
};

// Return exact time to display when a new message is sent
export const getCurrentTimeStr = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Combine users names to create room id for one-on-one chats
export const makePrivateId = (a, b) =>
  `private_${[a.toLowerCase(), b.toLowerCase()].sort().join('_')}`;

// Broadcast new system announcements
export const systemMessage = (text) => ({
  message: text,
  direction: "incoming",
  sender: "System",
  sentTime: getCurrentTimeStr()
});

// Template for all newly created chatrooms, to simplify chatroom creation
export const makeConversation = ({
  id, name, info = "Private Conversation", isGroup = false, isNotes = false,
  state = "active", messages = [], unread = 0, avatar
}) => ({
  id,
  name,
  avatar: avatar || getOfflineAvatar(name),
  status: "available",
  info,
  unread,
  isGroup,
  isNotes,
  state,
  messages
});
