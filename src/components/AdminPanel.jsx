import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = ({ socket, currentRoom, onClose }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    // Listen for online users updates
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('onlineUsers');
    };
  }, [socket]);

  const handleKickUser = () => {
    if (!selectedUser) return;
    
    setConfirmAction({
      type: 'kick',
      message: `Are you sure you want to kick this user?`,
      action: () => {
        socket.emit('kickUser', { 
          targetUserId: selectedUser, 
          roomId: currentRoom 
        });
        setSelectedUser('');
      }
    });
    setShowConfirm(true);
  };

  const handleClearMessages = () => {
    setConfirmAction({
      type: 'clear',
      message: 'Are you sure you want to clear all messages? This action cannot be undone.',
      action: () => {
        socket.emit('clearMessages', { roomId: currentRoom });
      }
    });
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (confirmAction) {
      confirmAction.action();
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h3>🛠️ Admin Panel</h3>
        <button className="close-button" onClick={onClose}>
          ✖️
        </button>
      </div>

      <div className="admin-section">
        <h4>👥 User Management</h4>
        <div className="user-controls">
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="user-select"
          >
            <option value="">Select a user...</option>
            {onlineUsers.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
          
          <button 
            className="kick-button"
            onClick={handleKickUser}
            disabled={!selectedUser}
          >
            🚫 Kick User
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h4>💬 Chat Management</h4>
        <div className="chat-controls">
          <button 
            className="clear-button"
            onClick={handleClearMessages}
          >
            🗑️ Clear All Messages
          </button>
        </div>
      </div>

      <div className="admin-info">
        <p><strong>Room:</strong> {currentRoom}</p>
        <p><strong>Online Users:</strong> {onlineUsers.length}</p>
      </div>

      {showConfirm && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <h4>⚠️ Confirm Action</h4>
            <p>{confirmAction?.message}</p>
            <div className="confirm-buttons">
              <button 
                className="confirm-yes"
                onClick={executeAction}
              >
                Yes, Continue
              </button>
              <button 
                className="confirm-no"
                onClick={cancelAction}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
