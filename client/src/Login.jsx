import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

export default function Login(){

    const [userName, setUserName] = useState('');
    const [userPassword, setPassword] = useState('');
    const [message, setMessage] = useState('')
    const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/Login', { userName, userPassword }, { withCredentials: true });
            setMessage('Logged in successfully');
            setLoggedInUser(response.data.userName)
            // Redirect to joinroom page
            navigate("/Joinroom");

        } catch(error){
            setMessage('Error logging in');
        }
    };

    const handleLogout = async () => {
        try{
            const response = await axios.post('http://localhost:5000/Logout', {}, { withCredentials: true });
            setMessage('Logged out successfully');
            setLoggedInUser(null);
        } catch(error){
            setMessage('Error logging out');
        }
    };

    const checkSession = async () => {
        try{
            const response = await axios.get('http://localhost:5000/Session-check', { withCredentials: true });
            setLoggedInUser(response.data.userName);
        } catch(error) {
            setLoggedInUser(null);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);


    return(
        <div className="Auth-login">
            <h1>Login</h1>
            {loggedInUser ? (
                <>
                    <p>Logged in as: {loggedInUser}</p>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <div>
                        <input
                        id="userName"
                        type="text"
                        placeholder="Username"
                        value={userName}
                        autoComplete="off"
                        required
                        onChange={(e) => setUserName(e.target.value)}
                        /><br></br>
                        <input
                        id="userPassword"
                        type="password"
                        placeholder="Password"
                        value={userPassword}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button onClick={handleLogin}>Login</button><br></br><br></br>
                    <Link to="/Signup">Create Account</Link>
                </>
            )}
            <p>{message}</p>
        </div>
    );
}