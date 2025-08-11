import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import JoinForm from './components/JoinForm';
import ChatRoom from './components/ChatRoom';
import AdminPanel from './components/AdminPanel';
import QRCodeDisplay from './components/QRCodeDisplay';
import { getSocketUrl } from './utils/api';
import './App.css';

const socket = io(getSocketUrl());

function App() {
  const [user, setUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Listen for connection events
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('kicked', (message) => {
      alert(message);
      handleLeaveRoom();
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('kicked');
    };
  }, []);

  const handleJoinRoom = (userData) => {
  // userData now contains isAdmin from server
  setUser(userData);
    setCurrentRoom(userData.roomId);
    setCurrentRoomName(userData.roomName || userData.roomId);
  };

  const handleLeaveRoom = () => {
    setUser(null);
    setCurrentRoom(null);
  setShowAdmin(false);
  setCurrentRoomName(null);
  };

  if (!user) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>🏠 Local Chat App</h1>
          <p>Connect with devices on your local network</p>
          <div className="header-buttons">
            <button 
              className="qr-button"
              onClick={() => setShowQR(!showQR)}
            >
              📱 Show QR Code
            </button>
          </div>
        </header>
        
        {showQR && <QRCodeDisplay />}
        
        <JoinForm socket={socket} onJoin={handleJoinRoom} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
  <h1>💬 {currentRoomName || currentRoom}</h1>
        <div className="header-buttons">
          {user?.isAdmin && (
            <button 
              className="admin-button"
              onClick={() => setShowAdmin(!showAdmin)}
            >
              ⚙️ Admin
            </button>
          )}
          <button 
            className="leave-button"
            onClick={handleLeaveRoom}
          >
            🚪 Leave
          </button>
        </div>
      </header>

      {user?.isAdmin && showAdmin && (
        <AdminPanel 
          socket={socket} 
          currentRoom={currentRoom}
          currentUser={user}
          onClose={() => setShowAdmin(false)}
        />
      )}

      <ChatRoom 
        socket={socket}
        user={user}
        roomId={currentRoom}
      />
    </div>
  );
}

export default App;
