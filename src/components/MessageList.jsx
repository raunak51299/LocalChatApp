import React from 'react';
import './MessageList.css';

const MessageList = ({ messages, currentUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="message-list">
      {messages.map((message) => {
        if (message.messageType === 'system') {
          return (
            <div key={message._id} className="message system-message">
              <div className="system-content">
                <span className="system-text">{message.content}</span>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          );
        }

        const isOwn = message.user?._id === currentUser?.userId;
        
        return (
          <div 
            key={message._id} 
            className={`message ${isOwn ? 'own-message' : 'other-message'}`}
          >
            <div className="message-content">
              {!isOwn && (
                <div className="message-header">
                  <span className="username">{message.user?.username}</span>
                </div>
              )}
              <div className="message-body">
                <span className="message-text">{message.content}</span>
                <span className="message-time">{formatTime(message.createdAt)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
