import { useEffect } from 'react';
import { getOfflineAvatar, makeConversation } from './conversationUtils';

// Creates personal notes chat with user's name
const notesKey = (name) => `personal_notes_${name.toLowerCase()}`;
const notesRoomId = (name) => `notes_${name.toLowerCase()}`;

// Grabs all past personal notes from localstorage
const loadNotes = (name) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(notesKey(name)));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Stores personal notes in localstorage for retrieval later
const saveNotes = (name, messages) => {
  try {
    localStorage.setItem(notesKey(name), JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save personal notes to browser storage:", error);
  }
};

// Owns the personal notes chat: builds it when the user logs in and keeps it saved
// in localstorage. Returns the notes room id so the rest of the app can find it.
export default function usePersonalNotes(currentUser, conversations, setConversations) {
  const notesId = notesRoomId(currentUser.name);

  // Load all past notes in personal chat upon login
  useEffect(() => {
    setConversations((prev) => {
      if (prev[notesId]) return prev;
      return {
        ...prev,
        [notesId]: makeConversation({
          id: notesId,
          name: `${currentUser.name} (You)`,
          avatar: currentUser.avatar || getOfflineAvatar(currentUser.name),
          info: "Personal notes, only you can see this",
          isNotes: true,
          messages: loadNotes(currentUser.name)
        })
      };
    });
  }, [notesId, currentUser.name, currentUser.avatar, setConversations]);

  // Stores all active messages in your personal notes chat for retrieval later
  const notesMessages = conversations[notesId]?.messages;
  useEffect(() => {
    if (notesMessages) saveNotes(currentUser.name, notesMessages);
  }, [notesMessages, currentUser.name]);

  return notesId;
}
