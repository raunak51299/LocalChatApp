import React, { useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/api';
import './JoinForm.css';

const JoinForm = ({ socket, onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('General');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available rooms
    fetchRooms();
  }, []);

  // Debug: Log the API URL being used
  useEffect(() => {
    const apiUrl = getApiBaseUrl();
    console.log('Using API URL:', apiUrl);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current host:', window.location.host);
    
    // Add a test to show this info on screen for debugging
    const debugElement = document.getElementById('debug-info');
    if (debugElement) {
      debugElement.textContent = `API: ${apiUrl}`;
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rooms`);
      const rooms = await response.json();
      setAvailableRooms(rooms);
      
      // Set default room if available
      if (rooms.length > 0 && !roomId) {
        setRoomId(rooms[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !roomId) return;

    setLoading(true);
    
    socket.emit('join', { username: username.trim(), roomId });
    
    socket.on('joinSuccess', (userData) => {
      onJoin({ ...userData, roomId });
      setLoading(false);
    });

    socket.on('error', (error) => {
      alert('Error joining room: ' + error);
      setLoading(false);
    });
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: `Room created by ${username || 'Anonymous'}`
        }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        setAvailableRooms([...availableRooms, newRoom]);
        setRoomId(newRoom._id);
        setNewRoomName('');
        setShowCreateRoom(false);
      } else {
        alert('Failed to create room');
      }
    } catch (error) {
      alert('Error creating room: ' + error.message);
    }
  };

  return (
    <div className="join-form-container">
      <div className="join-form">
        <h2>Join Chat Room</h2>
        
        {/* Debug info */}
        <div style={{fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textAlign: 'center'}}>
          <div id="debug-info">Loading...</div>
          <div>Host: {window.location.hostname}:{window.location.port}</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Your Name:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              maxLength="20"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">Select Room:</label>
            <select
              id="room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            >
              <option value="">Select a room...</option>
              {availableRooms.map((room) => (
                <option key={room._id} value={room._id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="create-room-btn"
              onClick={() => setShowCreateRoom(!showCreateRoom)}
            >
              {showCreateRoom ? 'Cancel' : 'Create New Room'}
            </button>
            
            <button 
              type="submit" 
              className="join-btn"
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Chat'}
            </button>
          </div>
        </form>

        {showCreateRoom && (
          <form onSubmit={handleCreateRoom} className="create-room-form">
            <h3>Create New Room</h3>
            <div className="form-group">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Room name..."
                maxLength="50"
                required
              />
            </div>
            <button type="submit" className="create-btn">
              Create Room
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default JoinForm;
