import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import OnlineUsers from './OnlineUsers';
import TypingIndicator from './TypingIndicator';
import { getApiBaseUrl } from '../utils/api';
import './ChatRoom.css';

const ChatRoom = ({ socket, user, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch chat history
    fetchMessages();

    // Socket event listeners
    socket.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('userJoined', (data) => {
      setMessages(prev => [...prev, {
        _id: Date.now(),
        content: data.message,
        messageType: 'system',
        createdAt: new Date()
      }]);
    });

    socket.on('userLeft', (data) => {
      setMessages(prev => [...prev, {
        _id: Date.now(),
        content: data.message,
        messageType: 'system',
        createdAt: new Date()
      }]);
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    socket.on('typingUsers', (users) => {
      setTypingUsers(users);
    });

    socket.on('messagesCleared', () => {
      setMessages([]);
    });

    return () => {
      socket.off('newMessage');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('onlineUsers');
      socket.off('typingUsers');
      socket.off('messagesCleared');
    };
  }, [socket, roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/rooms/${roomId}/messages`);
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content) => {
    socket.emit('sendMessage', { content, roomId });
  };

  const handleTyping = (isTyping) => {
    socket.emit('typing', { roomId, isTyping });
  };

  if (loading) {
    return (
      <div className="chat-room loading">
        <div className="loading-spinner">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-main">
        <div className="messages-container">
          <MessageList 
            messages={messages} 
            currentUser={user}
          />
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
        
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>

      <OnlineUsers users={onlineUsers} currentUser={user} />
    </div>
  );
};

export default ChatRoom;
