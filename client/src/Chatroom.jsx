import "./Chatroom.css"
import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"

// Establishing Socket IO connection with desired port
let endpoint = "http://localhost:5000";
let socket = io.connect(`${endpoint}`);


export default function Chatroom(){
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

  // Target and store state of user's current message
  function handleChange(event){
    setValue(event.target.value);
  }

  // Process single user's submitted message
  const handleSendMessage = (event) => {
    event.preventDefault(); // prevent page refresh
    setValue(event.target.value) // grab user's submitted message
    socket.emit("message", value) // pass user msg to server layer
    event.target.reset() // clear input field
  }

  // Store current message in message array for easy display
  useEffect(() => {
    socket.on("received_message", (data) => { // catch server response
      setMessages([...messages, "User [Time/Date]: " + data]); // store new msg in msgs array
      //alert(data) // Message gets printed multiple times
    })
  })

 
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
            <label htmlFor="userInput">
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