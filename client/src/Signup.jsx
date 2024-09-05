import { useState } from "react"
import { Link } from 'react-router-dom';

export default function Signup(){
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setPassword] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = { userName, userEmail, userPassword };
    
        try {
            const response = await fetch('/newUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                console.log('User added successfully!');
            } else {
                console.error('Error adding user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return(
        <div className="Auth-signup">
            <h1>Signup</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userName">
                    <input
                        type="text"
                        id="userName"
                        value = { userName }
                        onChange={(event) => setUserName(event.target.value)}
                        required
                        placeholder="Username"
                        autoComplete="off" />
                </label><br></br>
                <label htmlFor="userEmail">
                    <input
                        type="text"
                        id="userEmail"
                        value = { userEmail }
                        onChange={(event) => setUserEmail(event.target.value)}
                        required
                        placeholder="Email"
                        autoComplete="off" />
                </label><br></br>
                <label htmlFor="password">
                    <input
                        type="password"
                        id="userPassword"
                        value = { userPassword }
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        placeholder="Password" />
                </label><br></br>
                <label htmlFor="passwordConfirm">
                    <input type="password" id="passwordConfirm" required placeholder="Confirm Password" />
                </label><br></br>
                <button type="submit" id="signup-btn">Create Account</button>
            </form><br></br>
            <Link to="/">Login</Link>
        </div>
    );
}