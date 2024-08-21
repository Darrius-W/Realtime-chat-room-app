export default function Auth(){
    return(
        <div className="Auth-login">
            <h1>Login/Signup/Guest Login</h1>
            <form>
                <h2>Login</h2>
                <label htmlFor="username">
                    <input type="text" id="username" required placeholder="Username" autoComplete="off" />
                </label><br></br>
                <label htmlFor="password">
                    <input type="password" id="password" required placeholder="Password" />
                </label><br></br>
                <button type="submit" id="login-btn">Login</button>

                <hr></hr>
                <p>Don't have an account?</p>
                <button type="submit" id="guest-login-btn">Continue as guest</button>
            </form><br></br>
            <a href="#">Create account</a>
        </div>
    );
}