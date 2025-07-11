import React from 'react';
import './OnlineUsers.css';

const OnlineUsers = ({ users, currentUser }) => {
  return (
    <div className="online-users">
      <h3>Online Users ({users.length})</h3>
      <div className="users-list">
        {users.map((user) => (
          <div 
            key={user.userId} 
            className={`user-item ${user.userId === currentUser?.userId ? 'current-user' : ''}`}
          >
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="username">
                {user.username}
                {user.userId === currentUser?.userId && ' (You)'}
              </span>
              <div className="user-status">
                <span className="status-dot online"></span>
                Online
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="empty-users">
          <p>No users online</p>
        </div>
      )}
    </div>
  );
};

export default OnlineUsers;
