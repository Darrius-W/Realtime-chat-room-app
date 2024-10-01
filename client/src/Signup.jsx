import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom';
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
        event.preventDefault();
        const data = { userName, userEmail, userPassword };
        const userNameData = { name: userName }
    
        try {
            if (userPassword !== confirmPwd){
                alert("ERROR: Passwords Do Not Match");
                return;
            }

            const response = await fetch('/newUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                console.log('User added successfully!');
                navigate("https://dw-realtime-chatroom-app.netlify.app/Joinroom", { state: userNameData });
            } else {
                console.error('Error adding user.');
                alert("ERROR: Username Taken");
            }
        } catch (error) {
            console.error('Error:', error);
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