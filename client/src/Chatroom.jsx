import "./Chatroom.css"
import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useLocation, useNavigate } from "react-router-dom"
import axios from 'axios'

// Establishing Socket IO connection with desired port
const endpoint = "http://localhost:5000";
const socket = io.connect(`${endpoint}`);


export default function Chatroom(){

  const location = useLocation();
  const data = location.state;
  const [userName, setUserName] = useState(data.name);  
  const [room, setRoom] = useState(data.room);
  const navigate = useNavigate();
  const userNameData = { name: userName }

  /*useEffect(() => {
    fetch('/Room-check')
        .then(response => response.json())
        .then(roomData => setRoom(roomData));

    fetch('/Session-check')
    .then(response => response.json())
    .then(nameData => setUserName(nameData));
  
  }, []);*/
  
  const joinRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('join', { userName, room });
    }
  }

  joinRoom();

  const leaveRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('leave', { userName, room });
    }
    navigate('/Joinroom', { state: userNameData });
  }


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
      <button id="leaveBtn" onClick={ leaveRoom }>Leave Room</button>
    </>
  );
}
  

// Displays the current user
function CurrentUser(){
  const location = useLocation();
  const data = location.state;
  const [userName, setUserName] = useState(data.name);

  return(
    <>
      <div className="currUser">
        <h2>{ userName }</h2>
      </div>
    </>
  );
}


// Displays & inputs chat room messages
function ChatWindow(){
  const location = useLocation();
  const data = location.state;
  const [userName, setUserName] = useState(data.name);
  const [value, setValue] = useState(''); // User's current message
  const [messages, setMessages] = useState([]); // Array of chat room messages
  const [room, setRoom] = useState(data.room);

  useEffect(() => {
    /*fetch('/Room-check')
        .then(response => response.json())
        .then(roomData => setRoom(roomData));

    fetch('/Session-check')
    .then(response => response.json())
    .then(nameData => setUserName(nameData));*/

    socket.on("received_message", (data) => { // catch server response
      //setMessages([...messages, "User [Time/Date]: " + data.message]); // store new msg in msgs array
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });
    
    return () => {
      socket.off('received_message');
    };
  }, []);
  
  /*const joinRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('join', { userName, room });
    }
  };*/

  

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
    event.preventDefault();
    //joinRoom();
    if (value !== ''){
      socket.emit('message', { userName, room, value})
      socket.emit('updateMemList', { room })
      setValue('');
    }
    event.target.reset() // clear input field
    /*
    event.preventDefault(); // prevent page refresh
    setValue(event.target.value) // grab user's submitted message
    socket.emit("message", {value, room}) // pass user msg to server layer
    event.target.reset() // clear input field
    */
  }
  

  // Store current message in message array for easy display
  /*useEffect(() => {
    socket.on("received_message", (data) => { // catch server response
      alert("here")
      setMessages([...messages, "User [Time/Date]: " + data.message]); // store new msg in msgs array
      //setMessages((...messages) => [...messages, data.message]);
      //alert(data) // Message gets printed multiple times
    })
  })*/

 
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
            <button id="sendMsg" type="submit">Send</button><br></br><br></br>
          </form>
        </div>
      </div>
    </>
  );
}


// Displays all current members of the chat room
function ChatMembers(){

  const [userList, setUserList] = useState([]);
  const [room, setRoom] = useState('');

  useEffect(() => {

    socket.on("updateMems", (data) => { // catch server response
      setRoom(data.room);
      setUserList(data.members);
    });
  });

  return(
    <>
      <div>
        <h2>Members in room {room}:</h2>
        <ul>
          {userList.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>


      {/*<div className="memberDisp">
        <h2>Member List</h2>
        <ul>
          <li>Gary</li>
          <li>John</li>
          <li>Tyler</li>
        </ul>
      </div>*/}
    </>
  );
}