import { useEffect, useState } from "react";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Joinroom(){

    const [userData, setUserData] = useState('');
    const [message, setMessage] = useState('')
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/Session-check')
            .then(response => response.json())
            .then(data => setUserData(data));
    })

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

    function handleJoinRoom(){}

    return(
        <div>
            <h1>Join Room</h1>
            <h2>Welcome, { userData }</h2>
            <form onSubmit={handleJoinRoom}>
                <p>Enter chat room code:</p>
                <input type="text" id="room-code" placeholder="Enter Code" />
                <button type="submit">Join</button>
            </form><br></br>
            <button type="submit" onClick={handleLogout}>Logout</button>
        </div>
    );
}