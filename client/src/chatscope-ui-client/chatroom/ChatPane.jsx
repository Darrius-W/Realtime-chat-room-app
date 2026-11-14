import {
  Avatar,
  ChatContainer,
  ConversationHeader,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
  InfoButton
} from '@chatscope/chat-ui-kit-react';

// Right-hand messaging panel: header, message bubbles (including the accept / decline
// request bubble), and the text box once a chat is active
export default function ChatPane({
  activeChat,
  currentUser,
  isTyping,
  onBack,
  onRespond,
  onSend,
  onTyping
}) {
  // RIGHT ACTIVE MESSAGING VIEW PANEL
  if (!activeChat) {
    return (
      <div className="chat-empty-state">
        <h3>Select a conversation channel list card to begin messaging.</h3>
      </div>
    );
  }

  return (
    <ChatContainer>
      <ConversationHeader>
        <ConversationHeader.Back onClick={onBack} />
        <Avatar src={activeChat.avatar} name={activeChat.name} />
        <ConversationHeader.Content userName={activeChat.name} info={activeChat.info} />

        <ConversationHeader.Actions>
          <InfoButton />
        </ConversationHeader.Actions>
      </ConversationHeader>

      <MessageList typingIndicator={isTyping ? <TypingIndicator content={`${activeChat.name} is typing...`} /> : null}>
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
              sender={msg.sender.toLowerCase() === currentUser.name.toLowerCase() ? "You" : msg.sender}
              sentTime={msg.sentTime}
            />
            {msg.direction === "incoming" && <Avatar src={activeChat.avatar} name={activeChat.name} size="sm" />}
          </Message>
        ))}
        {activeChat.isNotes && activeChat.messages.length === 0 ? (
          <Message model={{ type: "custom", sender: "System", direction: "incoming", position: "single" }}>
            <Message.CustomContent>
              <em>This is your personal space. Jot down notes, drafts or links. Only you can see them.</em>
            </Message.CustomContent>
          </Message>
        ) : null}
        {activeChat.state === "incoming" ? (
          <Message model={{ type: "custom", sender: "System", direction: "incoming", position: "single" }}>
            <Message.CustomContent>
              <div className="chat-request">
                <strong>Accept this chat request from {activeChat.name}?</strong>
                <div className="chat-request-actions">
                  <button type="button" className="chat-btn chat-btn--accept" onClick={() => onRespond(true)}>
                    Accept
                  </button>
                  <button type="button" className="chat-btn chat-btn--decline" onClick={() => onRespond(false)}>
                    Decline
                  </button>
                </div>
              </div>
            </Message.CustomContent>
          </Message>
        ) : null}
        {activeChat.state === "outgoing" ? (
          <Message model={{ type: "custom", sender: "System", direction: "incoming", position: "single" }}>
            <Message.CustomContent>
              <em>Waiting for {activeChat.name} to accept your request...</em>
            </Message.CustomContent>
          </Message>
        ) : null}
      </MessageList>

      {activeChat.state === "active" ? (
        <MessageInput
          placeholder="Type message here..."
          onSend={onSend}
          onChange={onTyping}
          attachButton={true}
        />
      ) : null}
    </ChatContainer>
  );
}
