import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useLocation, useNavigate } from "react-router-dom"
import axios from 'axios'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import "./App.css"

// Establishing Socket IO connection with desired endpoint
const endpoint = "https://realtime-chat-room-app.onrender.com";
const socket = io.connect(`${endpoint}`);


export default function Chatroom(){

  const location = useLocation();
  const data = location.state;
  const [userName, setUserName] = useState(data.name);  
  const [room, setRoom] = useState(data.room);
  const navigate = useNavigate();
  const userNameData = { name: userName }

  
  const joinRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('join', { userName, room });
    }
  }

  joinRoom();


  return(
    <Container fluid className="main-chat-container">
      <Row className="justify-content-center">
        <Col md={2} style={{width: '20vw'}}>
          <Container className="chatroom-grid chat-container d-none d-md-block">
             {/*Chat Room Members*/}
            <ChatMembers />
          </Container>
        </Col>
        <Col md={7}>
          <Container className="chatroom-grid chat-container">
            <Row>
              <Col>
                {/* Current Chat User */}
                <CurrentUser />
              </Col>
            </Row>
            <Row>
              {/* Display Window */}
              <ChatWindow />
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
  

// Displays the current user
function CurrentUser(){
  const location = useLocation();
  const data = location.state;
  const [userName, setUserName] = useState(data.name);
  const [room, setRoom] = useState(data.room);
  const navigate = useNavigate();
  const userNameData = { name: userName }

  const leaveRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('leave', { userName, room });
    }
    navigate('/Joinroom', { state: userNameData });
  }

  return(
    <>
      <div className="currUser" style={{ borderBottom: '1px solid rgb(255, 255, 255, 0.1)' }}>
        <Row>
          <Col><h2 className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600'}}>Room: { room }</h2></Col>
          <Col className="d-flex justify-content-end align-items-center"><Button className="bg-danger back-btn p-2" id="leaveBtn" onClick={ leaveRoom }>Exit Room</Button></Col>
        </Row>
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

    socket.on("received_message", (data) => { // catch server response
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });
    
    return () => {
      socket.off('received_message');
    };
  }, []);
  

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
  }

 
  return(
    <>
      <Container className="chatWindow">
        <Container className="chatDisplay" style={{ height: '100vh'}}>
          {messages.map((msg, index) => (
            <p className="msg-list p-2 mx-auto" style={{ color: '#fff' }} key={index}>{msg}</p>
          ))}
          <AlwaysScrollToBottom />
        </Container>

        <Container className="chatInput" style={{paddingTop: '2vh', borderTop: '1px solid rgb(255, 255, 255, 0.1)'}}>
          <Form onSubmit={handleSendMessage}>
            <Row>
              <Col md={9}>
                <Form.Control
                  className="custom-input p-2"
                  id="userInput"
                  type="text"
                  defaultValue={""}
                  placeholder="Type your message..."
                  onInput={handleChange}
                  required 
                  autoComplete="off"
                />
              </Col>
              <Col md={3} className="d-flex">
                <Button className="d-flex custom-btn justify-content-center" id="sendMsg" type="submit">Send</Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </Container>
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
    <Card className="bg-transparent" style={{border: 'none', borderBottom: 'none'}}>
      <Card.Header as="h2" className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600', borderBottom: '1px solid rgb(255, 255, 255, 0.1)'}}>Online</Card.Header>
      <Card.Body>
        <ul style={{ listStyleType: 'none' }}>
          {userList.map((user, index) => (
            <li className="p-2 mx-auto" style={{ color: '#fff' }} key={index}>{user}</li>
          ))}
        </ul>
      </Card.Body>
    </Card>
  );
}