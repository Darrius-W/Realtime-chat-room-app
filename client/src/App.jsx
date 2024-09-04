import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatroom from './Chatroom';
import Signup from './Signup';
import Login from './Login';
import Joinroom from './Joinroom';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Chatroom" element={<Chatroom />} />
        <Route path="/Joinroom" element={<Joinroom />} />
      </Routes>
    </Router>
  );
}