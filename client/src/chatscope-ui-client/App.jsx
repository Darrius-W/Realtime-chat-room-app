import { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import Chatroom from './Chatroom';

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [authScreen, setAuthScreen] = useState("login");

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthScreen("login");
  };

  // ==========================================================================
  // 1. GATEWAY ROUTING FOR UNAUTHENTICATED USERS
  // ==========================================================================
  if (!currentUser) {
    if (authScreen === "signup") {
      return (
        <Signup 
          onSignup={(userData) => setCurrentUser(userData)} 
          onSwitchToLogin={() => setAuthScreen("login")} 
        />
      );
    }
    return (
      <Login 
        onLogin={(userData) => setCurrentUser(userData)} 
        onSwitchToSignup={() => setAuthScreen("signup")} 
      />
    );
  }

  // ==========================================================================
  // 2. CORE INTEGRATED APPLICATION VIEW
  // ==========================================================================
  return (
    <Chatroom 
      currentUser={currentUser} 
      onSignOut={handleSignOut} 
    />
  );
}
