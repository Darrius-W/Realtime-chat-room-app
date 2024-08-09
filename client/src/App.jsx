import "./App.css"
import { useState, useEffect, useRef } from "react"

export default function App(){
  return(
    <>
      <div className="chatRoom">
        {/* Current Chat User */}
        <CurrentUser />
        {/* Display Window */}
        <ChatWindow />
        {/* Chat Room Members */}
        <ChatMembers />
      </div>
    </>
  );
}

// Displays the current user
function CurrentUser(){
  return(
    <>
      <div className="currUser">
        <h2>John Doe</h2>
      </div>
    </>
  );
}

// Displays & inputs chat room messages
function ChatWindow(){
  const [value, setValue] = useState(""); // User's current message
  const [messages, setMessages] = useState([]); // Array of chat room messages

  // Keeps display at most recent messages
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  // Store newly inputed messages into conversation array
  function handleSendMessage(event){
    event.preventDefault();
    setMessages([...messages, "User [Time/Date]: " + value]);
    event.target.reset()
  }

  // Target and store user's current message
  function handleChange(event){
    setValue(event.target.value);
  }
 
  return(
    <>
      <div className="chatWindow">
        <div className="chatDisplay">
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
          <AlwaysScrollToBottom />
        </div>

        <div className="chatInput">
          <form onSubmit={handleSendMessage}>
            <label for="userInput">
              <input
                id="userInput"
                type="text"
                defaultValue={""}
                placeholder="Message..."
                onInput={handleChange} 
                required 
                autoComplete="off"
              />
            </label>
            <button id="sendMsg" type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
}

// Displays all current members of the chat room
function ChatMembers(){
  return(
    <>
      <div className="memberDisp">
        <h2>Member List</h2>
        <ul>
          <li>Gary</li>
          <li>John</li>
          <li>Tyler</li>
        </ul>
      </div>
    </>
  );
}