import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useLocation, useNavigate } from "react-router-dom"
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


// Primary chatroom component to house all the chatroom's subcomponents
export default function Chatroom(){

  const location = useLocation();
  const data = location.state;
  const userName = data.name;
  const room = data.room;

  const joinRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('join', { userName, room }); // Send request to server, joining user to room
    }
  }

  joinRoom();


  return(
    <Container fluid className="main-chat-container">
      <Row className="justify-content-center">
        <Col md={2} style={{width: '20vw'}}>
          <Container className="chatroom-grid chat-container d-none d-md-block">
             {/*Displays ALl Chat Room Members*/}
            <ChatMemberList />
          </Container>
        </Col>
        <Col md={7}>
          <Container className="chatroom-grid chat-container">
            <Row>
              <Col>
                {/* Displays the Currently Active User */}
                <DisplayActiveUser />
              </Col>
            </Row>
            <Row>
              {/* Displays The Live Chat Window */}
              <ChatWindow />
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
  

// Displays the currently active user, giving them the ability to exit the room
function DisplayActiveUser(){
  const location = useLocation();
  const data = location.state;
  const userName = data.name;
  const room = data.room;
  const navigate = useNavigate();
  const userNameData = { name: userName }

  const leaveRoom = () => {
    if (userName !== '' && room !== '') {
      socket.emit('leave', { userName, room }); // Upon request, send server request to remove user from room
    }
    navigate('/Joinroom', { state: userNameData }); // Redirect active user to select another room to join
  }

  return(
    <>
      <div className="currUser" style={{ borderBottom: '1px solid rgb(255, 255, 255, 0.1)' }}>
        <Row>
          <Col><h2 className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600'}}>Room: { room }</h2></Col>
          <Col className="d-flex justify-content-end align-items-center">
            <Button 
              className="bg-danger back-btn p-2" id="leaveBtn" onClick={ leaveRoom }>Exit Room
            </Button>
          </Col>
        </Row>
      </div>
    </>
  );
}


// Displays all live chats and allows active user to send a new message
function ChatWindow(){
  const location = useLocation();
  const data = location.state;
  const userName = data.name;
  const room = data.room;
  const [currMsg, setCurrMsg] = useState(''); // User's current message
  const [allMessages, setAllMessages] = useState([]); // List of all chat room messages

  useEffect(() => {

    socket.on("received_message", (data) => { // If another user sends message, activate event
      setAllMessages((prevMessages) => [...prevMessages, data.message]); // Update server room message list
    });
    
    return () => {
      socket.off('received_message'); // shut off socket listener event
    };
  }, []);
  

  // Scroll to the most recently submitted message in the chat
  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  // Target and store state of user's current message
  function handleChange(event){
    setCurrMsg(event.target.value);
  }

  // Process single user's submitted message
  const handleSendMessage = (event) => {
    event.preventDefault();

    if (currMsg !== ''){
      socket.emit('message', { userName, room, currMsg}) // Tell server who sent, what, and where message is sent
      setCurrMsg(''); // After messages updated, clear current message
    }
    event.target.reset() // clear input field
  }

 
  return(
    <>
      <Container className="chatWindow">
        <Container className="chatDisplay" style={{ height: '100vh'}}>
          {allMessages.map((msg, index) => (
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


// Displays all current users within a given chat room
function ChatMemberList(){

  const [userList, setUserList] = useState([]);

  useEffect(() => {

    socket.on("updateMems", (data) => { // listen for new members entering room and send request to update list
      setUserList(data.members);
    });

    return () => {
      socket.off('updateMems'); // shut off socket listener event
    };
  });

  return(
    <Card className="bg-transparent" style={{border: 'none', borderBottom: 'none'}}>
      <Card.Header
        as="h2"
        className="p-2 mx-auto"
        style={{ color: '#fff', fontWeight: '600', borderBottom: '1px solid rgb(255, 255, 255, 0.1)'}}
      >Online</Card.Header>
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