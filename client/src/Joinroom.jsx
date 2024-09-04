export default function Joinroom(){
    
    function handleSubmit(){}

    return(
        <div>
            <h1>Join Room</h1>
            <h2>Welcome "User"</h2>
            <form onSubmit={handleSubmit}>
                <p>Enter chat room code:</p>
                <input type="text" id="room-code" placeholder="Enter Code" />
                <button type="submit">Join</button>
            </form>
        </div>
    );
}