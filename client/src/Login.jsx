import { useState } from "react"
import { Link } from 'react-router-dom';

export default function Login(){

    const [userName, setUserName] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const data = { userName };
    }

    return(
        <div className="Auth-login">
            <h1>Login</h1>
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
                <label htmlFor="password">
                    <input type="password" id="password" required placeholder="Password" />
                </label><br></br>
                <button type="submit" id="signup-btn">Login</button>
            </form><br></br>
            <Link to="/Signup">Create Account</Link>
        </div>
    );
}