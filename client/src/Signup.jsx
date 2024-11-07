import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Stack from 'react-bootstrap/Stack';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import './App.css'

export default function Signup(){

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent refresh so that user may be redirected
    
        try {
            // Check if passwords match
            if (userPassword !== confirmPwd){
                alert("ERROR: Passwords do not match");
                return;
            }

            // Send request to server to create a new user
            const response = await axios.post('https://realtime-chat-room-app.onrender.com/newUser', { userName, userEmail, userPassword }, {headers: { 'Content-Type': 'application/json' }}, { withCredentials: true })
    
            if (response.status === 201) { // Signup: Successful
                // Redirect user to joinroom page
                alert('Account creation successful');
                navigate("/Joinroom", { state: { name: userName } });
            }

        } catch (error) { // Signup: Failed
            alert("ERROR: Username taken");
        }
    };
    

    return(
        <Form onSubmit={handleSubmit}>
            <Stack className="signup-stack custom-container justify-content-center col-md-4 gap-4 px-4 mx-auto">
                <h1 className="p-2 mx-auto" style={{ color: '#fff', fontWeight: '600'}}>Sign up</h1>
                    <Form.Control
                        className="custom-input p-2"
                        type="text"
                        id="userName"
                        value = { userName }
                        onChange={(event) => setUserName(event.target.value)}
                        required
                        placeholder="Username"
                        autoComplete="off"
                    />
                    <Form.Control
                        className="custom-input p-2"
                        type="text"
                        id="userEmail"
                        value = { userEmail }
                        onChange={(event) => setUserEmail(event.target.value)}
                        required
                        placeholder="Email"
                        autoComplete="off"
                    />
                    <Form.Control
                        className="custom-input p-2"
                        type="password"
                        id="userPassword"
                        value = { userPassword }
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        placeholder="Password"
                    />
                    <Form.Control
                        className="custom-input p-2"
                        type="password"
                        id="confirmPwd"
                        value = { confirmPwd }
                        onChange={(event) => setConfirmPwd(event.target.value)}
                        required
                        placeholder="Confirm Password"
                    />
                    <Button className="custom-btn p-2" variant="primary" type="submit" id="signup-btn">Create Account</Button>
                    <p className="p-2 mx-auto" style={{ color: '#fff' }}>Already have an account? <Link to="/" style={{ textDecoration: 'none', textWrap: 'nowrap' }}>Login</Link></p>
            </Stack>
        </Form>
    );
}