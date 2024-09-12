import { useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
//import io from 'socket.io-client'

//const socket = io.connect('http://localhost:5000');

export default function Joinroom(){

    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state;
    const [userName, setUserName] = useState(data.name);
    const [message, setMessage] = useState('')
    const [room, setRoom] = useState('');


    const handleLogout = async () => {
        try{
            const response = await axios.post('http://localhost:5000/Logout', {}, { withCredentials: true });
            setMessage('Logged out successfully');
            // Redirect to login page
            navigate("/Login");
            //setLoggedInUser(null);
        } catch(error){
            setMessage('Error logging out');
        }
    };


    const handleJoinRoom = () => {
        /*if (userName !== '' && room !== '') {
          socket.emit('join', { userName, room });
        }*/
        const data = { name: userName, room: room}
        navigate("/Chatroom", { state: data });
      };
    /*const handleJoinRoom = async () => {
        try {
            if (room !== ''){
                socket.emit('join', {userName, room })
            
                const response = await axios.post('http://localhost:5000/join_room_route', { room }, { withCredentials: true });
                setMessage('Joined room successfully');
                setCurrRoom(response.data.room)
                // Redirect to Chatroom page
                navigate("/Chatroom");
            }

        } catch(error){
            setMessage('Error joining room');
        }
    }*/

    return(
        <div>
            <h1>Join Room</h1>
            <h2>Welcome, { userName }</h2>
            <div>
                <p>Enter chat room code:</p>
                <input
                    type="text"
                    id="room-code"
                    placeholder="Enter Code"
                    value={room}
                    onChange={(event) => setRoom(event.target.value)} />
                <button onClick={handleJoinRoom}>Join Room</button>
            </div><br></br>
            <h2>Current Rooms:</h2><br></br>
            <button type="submit" onClick={handleLogout}>Logout</button>
        </div>
    );
}