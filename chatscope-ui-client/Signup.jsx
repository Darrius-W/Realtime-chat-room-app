import { useState } from 'react';
import multiavatar from '@multiavatar/multiavatar';

export default function Signup({ onSignup, onSwitchToLogin }) {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 

    const cleanName = usernameInput.trim();

    // 1. Username Validation (FIXED: Set to 6 characters to match your requirements)
    if (!cleanName) {
      setErrorMessage("Username cannot be empty.");
      return;
    }
    if (cleanName.length < 6) {
      setErrorMessage("Username must be at least 6 characters long.");
      return;
    }

    // 2. Password Length Validation (Strictly 6 characters)
    if (passwordInput.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    // 3. Confirm Password Match Validation
    if (passwordInput !== confirmPasswordInput) {
      setErrorMessage("Passwords do not match. Please verify your inputs.");
      return;
    }

    try {
      setIsSubmitting(true);
      const rawSvgCode = multiavatar(cleanName);

      // Execute signup function callback
      await onSignup({
        name: cleanName,
        password: passwordInput,
        avatar: `data:image/svg+xml;utf8,${encodeURIComponent(rawSvgCode)}`
      });

    } catch (err) {
      setErrorMessage(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cs-login-page-container">
      <div className="cs-login-box">
        <div className="cs-login-brand">chatscope</div>

        <p className="cs-login-tagline">
          Create your account.
        </p>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="cs-auth-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username Input (FIXED: Placeholder updated to match 6 character requirement) */}
          <div className="cs-login-field-group">
            <input
              type="text"
              placeholder="Username (min 6 chars)"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              maxLength={20}
              disabled={isSubmitting}
              required
              autoFocus
            />
          </div>

          {/* Password Input */}
          <div className="cs-login-field-group" style={{ marginTop: "16px" }}>
            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div className="cs-login-field-group" style={{ marginTop: "16px" }}>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
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
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="cs-auth-switch-prompt">
          Already have an account? 
          <span className="cs-auth-switch-link" onClick={onSwitchToLogin}>
            Log in
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
