import { useState } from 'react';
import multiavatar from '@multiavatar/multiavatar';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    const cleanName = usernameInput.trim();

    // Frontend Validations
    if (!cleanName) {
      setErrorMessage("Username cannot be empty.");
      return;
    }
    if (!passwordInput) {
      setErrorMessage("Please enter your password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const rawSvgCode = multiavatar(cleanName);

      // Execute login against parent function context
      await onLogin({
        name: cleanName,
        password: passwordInput,
        avatar: `data:image/svg+xml;utf8,${encodeURIComponent(rawSvgCode)}`
      });
      
    } catch (err) {
      // Captures server rejections or validation failures passed up through the chain
      setErrorMessage(err?.message || "Invalid username or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cs-login-page-container">
      <div className="cs-login-box">
        <div className="cs-login-brand">chatscope</div>

        <p className="cs-login-tagline">
          Login to your account.
        </p>

        {errorMessage && (
          <div className="cs-auth-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="cs-login-field-group">
            <input
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              maxLength={20}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="cs-login-field-group" style={{ marginTop: "16px" }}>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className="cs-login-submit-btn"
            style={{ marginTop: "20px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="cs-auth-switch-prompt">
          Don't have an account? 
          <span className="cs-auth-switch-link" onClick={onSwitchToSignup}>
            Sign up
          </span>
        </p>

        <div className="cs-login-footer" style={{ marginTop: "20px" }}>
          UI components provided by: <br />
          <span className="cs-footer-logo">
            chatscope · chatscope.io
          </span>
        </div>
      </div>
    </div>
  );
}
