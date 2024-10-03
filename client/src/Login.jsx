import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './App.css'

export default function Login(){

    const [userName, setUserName] = useState('');
    const [userPassword, setPassword] = useState('');
    const [message, setMessage] = useState('')
    //const [loggedInUser, setLoggedInUser] = useState(null);
    const navigate = useNavigate();


    const handleLogin = async (event) => {
        const data = { name: userName }
        event.preventDefault()
        try {
            alert("here");
            const response = await axios.post('https://realtime-chat-room-app.onrender.com/LoginUser', { userName, userPassword }, { withCredentials: true })
                .then(response => {
                    alert("here3");
                    setMessage('Logged in successfully');
                    navigate("/Joinroom", { state: data });
                })
                .catch(error => alert("ERROrrr: Invalid Credentials"));
            //const response = await axios.post('http://localhost:5000/Login', { userName, userPassword }, { withCredentials: true });
            alert("here2");
            /*if(response.status === 200){
                alert("here3");
                setMessage('Logged in successfully');
                //setLoggedInUser(response.data.userName)
                // Redirect to joinroom page
                const data = { name: userName }
                navigate("https://dw-realtime-chatroom-app.netlify.app/Joinroom", { state: data });
            }*/

        } catch(error){
            setMessage('Error logging in');
            alert("ERROR: Invalid Credentials");
        }
    };


    return(
        <Form onSubmit={ handleLogin }>
            <Stack className="login-stack custom-container justify-content-center col-md-4 gap-4 px-4 mx-auto">
                <h1 className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600'}}>Sign In</h1>
                <Form.Control
                    className="custom-input p-2"
                    id="userName"
                    type="text"
                    placeholder="Username"
                    value={userName}
                    autoComplete="off"
                    required
                    onChange={(e) => setUserName(e.target.value)}
                />
                <Form.Control
                    className="custom-input p-2"
                    id="userPassword"
                    type="password"
                    placeholder="Password"
                    value={userPassword}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button id="login-btn" className="custom-btn p-2" variant="primary" type="submit">Login</Button>
                <p className="p-2 mx-auto" style={{ color: '#fff' }}>Not registered? <Link to="/Signup" style={{ textDecoration: 'none', textWrap: 'nowrap' }}>Create Account</Link></p>
            </Stack>
        </Form>
    );
}