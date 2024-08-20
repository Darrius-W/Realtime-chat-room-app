import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chatroom from './Chatroom';
import Auth from './Auth';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/Chatroom" element={<Chatroom />} />
      </Routes>
    </Router>
  );
}