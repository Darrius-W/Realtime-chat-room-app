import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatroom from './Chatroom';
import Signup from './Signup';
import Login from './Login';
import Joinroom from './Joinroom';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="https://dw-realtime-chatroom-app.netlify.app/" element={<Login />} />
        <Route path="https://dw-realtime-chatroom-app.netlify.app/Login" element={<Login />} />
        <Route path="https://dw-realtime-chatroom-app.netlify.app/Signup" element={<Signup />} />
        <Route path="https://dw-realtime-chatroom-app.netlify.app/Chatroom" element={<Chatroom />} />
        <Route path="https://dw-realtime-chatroom-app.netlify.app/Joinroom" element={<Joinroom />} />
      </Routes>
    </Router>
  );
}