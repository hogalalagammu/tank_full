import React, { useEffect } from 'react';
import GameScreen from './pages/GameScreen';
import GameHomePage from './pages/GameHomePage';
import Win from './pages/Win';
import Loss from './pages/Loss';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomScreen from './pages/RoomScreen';
import socket from './socket';  // Import the global socket instance

function App() {
  useEffect(() => {
    socket.connect();   // Connect socket when the app starts
    return () => socket.disconnect();  // Disconnect when the app unmounts
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameHomePage />} />
        <Route path="/room" element={<RoomScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/loss" element={<Loss />} />
        <Route path="/win" element={<Win />} />
      </Routes>
    </Router>
  );
}

export default App;
