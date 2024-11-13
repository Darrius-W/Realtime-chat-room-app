import { useState } from "react";
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './App.css';


export default function Joinroom(){

    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;
    const userName = data.name;
    const [room, setRoom] = useState('');


    const handleLogout = async () => {
        try{ // Logout: Successful
            // Send request to server to access logout functionality
            const response = await axios.get('https://realtime-chat-room-app.onrender.com/Logout');
            // Redirect to login page
            if (response.status == 200){
                navigate("/Login");
            }
        }
        catch(error){ // Logout: Failed
            alert('Error logging out');
        }
    };

    const handleJoinRoom = () => {
        // Redirect user to requested room
        navigate("/Chatroom", { state: { name: userName, room: room} });
      };

    return(
        <Form onSubmit={ handleJoinRoom }>
            <Stack className="join-stack custom-container justify-content-center col-md-4 gap-4 px-4 mx-auto">
                <h1 className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600'}}>Welcome, { userName }</h1>
                <p className="p-2 mx-auto" style={{ color: '#fff' }}>Enter the room's code to join a chat room:</p>
                <Form.Control
                    className="custom-input p-2"
                    type="text"
                    id="room-code"
                    placeholder="Enter Code"
                    required
                    autoComplete="off"
                    value={room}
                    onChange={(event) => setRoom(event.target.value)} />
                <Button className="custom-btn p-2" variant="primary" id="join-btn" type="submit">Join Room</Button>
                <p className="mx-auto" style={{ color: '#fff' }}>Or</p>
                <Button className="back-btn bg-danger p-2" onClick={handleLogout}>Logout</Button>
            </Stack>
        </Form>
    );
}