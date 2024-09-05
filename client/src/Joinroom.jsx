import { useEffect, useState } from "react";

export default function Joinroom(){

    const [userData, setUserData] = useState('');

    useEffect(() => {
        fetch('/Session-check')
            .then(response => response.json())
            .then(data => setUserData(data));
    })

    function handleJoinRoom(){}

    return(
        <div>
            <h1>Join Room</h1>
            <h2>Welcome, { userData }</h2>
            <form onSubmit={handleJoinRoom}>
                <p>Enter chat room code:</p>
                <input type="text" id="room-code" placeholder="Enter Code" />
                <button type="submit">Join</button>
            </form>
        </div>
    );
}