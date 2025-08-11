const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const os = require('os');
const sanitizeHtml = require('sanitize-html');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

const allowedOrigins = [
  `http://localhost:5173`,
  `http://127.0.0.1:5173`,
  `http://${localIP}:5173`
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Models
const Message = require('./models/Message');
const User = require('./models/User');
const Room = require('./models/Room');

// Store online users and their socket IDs
const onlineUsers = new Map();
const typingUsers = new Map();

const PORT = process.env.PORT || 3001;

// Routes
app.get('/api/qr', async (req, res) => {
  try {
    const url = `http://${localIP}:5173`;
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode, url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find().populate('messages', '', '', { sort: { createdAt: -1 }, limit: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, description } = req.body;
    const sanitizedName = sanitizeHtml(name, { allowedTags: [], allowedAttributes: {} });
    const sanitizedDescription = sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} });

    if (!sanitizedName) {
      return res.status(400).json({ error: 'Room name cannot be empty or just HTML tags.' });
    }

    const room = new Room({ name: sanitizedName, description: sanitizedDescription });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.get('/api/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ room: roomId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', async (data) => {
    try {
      const sanitizedUsername = sanitizeHtml(data.username, { allowedTags: [], allowedAttributes: {} });
      if (!sanitizedUsername || sanitizedUsername.trim().length === 0) {
        socket.emit('error', 'Invalid username.');
        return;
      }
      const { roomId } = data;
      const username = sanitizedUsername; // Use the sanitized username going forward
      
      // Create or find user
      let user = await User.findOne({ username });

      // Check if user is blocked
      if (user && user.isBlocked) {
        socket.emit('error', 'You have been blocked from the chat.');
        return;
      }

      if (username.toLowerCase() === 'admin') {
        if (data.password !== process.env.ADMIN_PASSWORD) {
          socket.emit('error', 'Invalid admin password');
          return;
        }
        // If admin password is correct, ensure user is marked as admin
        if (!user) {
          user = new User({ username, socketId: socket.id, isAdmin: true });
          await user.save();
        } else {
          user.isAdmin = true;
        }
      }

      if (!user) {
        // For regular users, create if they don't exist
        user = new User({ username, socketId: socket.id, isAdmin: false });
        await user.save();
      } else {
        user.socketId = socket.id;
        user.isOnline = true;
        await user.save();
      }

      // Store user info
      onlineUsers.set(socket.id, { user: user._id, username, roomId });
      
      // Join room
      socket.join(roomId);
      
      // Emit to room that user joined
      socket.to(roomId).emit('userJoined', {
        username,
        userId: user._id,
        message: `${username} joined the chat`
      });

      // Send current online users to the new user
      const roomUsers = Array.from(onlineUsers.values())
        .filter(u => u.roomId === roomId)
        .map(u => ({ username: u.username, userId: u.user }));
      
      io.to(roomId).emit('onlineUsers', roomUsers);
      
      socket.emit('joinSuccess', { userId: user._id, username, isAdmin: !!user.isAdmin });
    } catch (error) {
      socket.emit('error', 'Failed to join room');
    }
  });

  // Provide current online users in a room on demand (useful when opening admin panel later)
  socket.on('getOnlineUsers', (data) => {
    try {
      const { roomId } = data || {};
      if (!roomId) return;
      const roomUsers = Array.from(onlineUsers.values())
        .filter(u => u.roomId === roomId)
        .map(u => ({ username: u.username, userId: u.user }));
      // Respond only to the requester
      socket.emit('onlineUsers', roomUsers);
    } catch (error) {
      socket.emit('error', 'Failed to get online users');
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const sanitizedContent = sanitizeHtml(data.content, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
        allowedAttributes: {
          'a': [ 'href' ]
        }
      });

      if (!sanitizedContent || sanitizedContent.trim().length === 0) {
        // Don't send empty messages
        return;
      }

      const { roomId } = data;
      const userInfo = onlineUsers.get(socket.id);
      
      if (!userInfo) return;

      const message = new Message({
        content: sanitizedContent,
        user: userInfo.user,
        room: roomId
      });
      
      await message.save();
      await message.populate('user', 'username');

      io.to(roomId).emit('newMessage', {
        _id: message._id,
        content: message.content,
        user: message.user,
        createdAt: message.createdAt
      });
    } catch (error) {
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('typing', (data) => {
    const { roomId, isTyping } = data;
    const userInfo = onlineUsers.get(socket.id);
    
    if (!userInfo) return;

    if (isTyping) {
      typingUsers.set(socket.id, { username: userInfo.username, roomId });
    } else {
      typingUsers.delete(socket.id);
    }

    const roomTypingUsers = Array.from(typingUsers.values())
      .filter(u => u.roomId === roomId)
      .map(u => u.username);

    socket.to(roomId).emit('typingUsers', roomTypingUsers);
  });

  // Admin functions
  socket.on('kickUser', async (data) => {
    try {
      const { targetUserId, roomId } = data;
      const adminInfo = onlineUsers.get(socket.id);
      
      if (!adminInfo) return;

      // Check if user is admin (you can implement admin logic here)
      const admin = await User.findById(adminInfo.user);
      if (!admin.isAdmin) {
        socket.emit('error', 'Unauthorized');
        return;
      }

      // Find target user's socket
      const targetSocket = Array.from(onlineUsers.entries())
        .find(([_, userInfo]) => userInfo.user.toString() === targetUserId);

      if (targetSocket) {
        const [targetSocketId, targetUserInfo] = targetSocket;
        io.to(targetSocketId).emit('kicked', 'You have been kicked from the room');
        io.sockets.sockets.get(targetSocketId)?.leave(roomId);
        onlineUsers.delete(targetSocketId);
        
        // Notify room
        io.to(roomId).emit('userLeft', {
          username: targetUserInfo.username,
          message: `${targetUserInfo.username} was kicked from the chat`
        });

        // Update online users
        const roomUsers = Array.from(onlineUsers.values())
          .filter(u => u.roomId === roomId)
          .map(u => ({ username: u.username, userId: u.user }));
        
        io.to(roomId).emit('onlineUsers', roomUsers);
      }
    } catch (error) {
      socket.emit('error', 'Failed to kick user');
    }
  });

  socket.on('blockUser', async (data) => {
    try {
      const { targetUserId, roomId } = data;
      const adminInfo = onlineUsers.get(socket.id);

      if (!adminInfo) return;

      // Check if user is admin
      const admin = await User.findById(adminInfo.user);
      if (!admin.isAdmin) {
        socket.emit('error', 'Unauthorized');
        return;
      }

      // Block user in DB
      await User.findByIdAndUpdate(targetUserId, { isBlocked: true });

      // Find target user's socket and kick them
      const targetSocket = Array.from(onlineUsers.entries())
        .find(([_, userInfo]) => userInfo.user.toString() === targetUserId);

      if (targetSocket) {
        const [targetSocketId, targetUserInfo] = targetSocket;
        io.to(targetSocketId).emit('kicked', 'You have been blocked and kicked from the room.');
        io.sockets.sockets.get(targetSocketId)?.leave(roomId);
        onlineUsers.delete(targetSocketId);

        io.to(roomId).emit('userLeft', {
          username: targetUserInfo.username,
          message: `${targetUserInfo.username} was blocked from the chat.`
        });

        const roomUsers = Array.from(onlineUsers.values())
          .filter(u => u.roomId === roomId)
          .map(u => ({ username: u.username, userId: u.user }));

        io.to(roomId).emit('onlineUsers', roomUsers);
      }
    } catch (error) {
      socket.emit('error', 'Failed to block user');
    }
  });

  socket.on('clearMessages', async (data) => {
    try {
      const { roomId } = data;
      const adminInfo = onlineUsers.get(socket.id);
      
      if (!adminInfo) return;

      // Check if user is admin
      const admin = await User.findById(adminInfo.user);
      if (!admin.isAdmin) {
        socket.emit('error', 'Unauthorized');
        return;
      }

      await Message.deleteMany({ room: roomId });
      io.to(roomId).emit('messagesCleared');
    } catch (error) {
      socket.emit('error', 'Failed to clear messages');
    }
  });

  // Clear ALL messages across all rooms (admin only)
  socket.on('clearAllMessages', async (data) => {
    try {
      const adminInfo = onlineUsers.get(socket.id);
      
      if (!adminInfo) return;

      // Check if user is admin
      const admin = await User.findById(adminInfo.user);
      if (!admin.isAdmin) {
        socket.emit('error', 'Unauthorized');
        return;
      }

      const result = await Message.deleteMany({});
      console.log(`Admin cleared ${result.deletedCount} messages from all rooms`);
      
      // Notify all rooms
      io.emit('allMessagesCleared', { 
        message: 'All chat history has been cleared by an administrator',
        deletedCount: result.deletedCount 
      });
    } catch (error) {
      socket.emit('error', 'Failed to clear all messages');
    }
  });

  socket.on('disconnect', async () => {
    try {
      const userInfo = onlineUsers.get(socket.id);
      
      if (userInfo) {
        // Update user offline status
        await User.findByIdAndUpdate(userInfo.user, { isOnline: false });
        
        // Remove from online users
        onlineUsers.delete(socket.id);
        typingUsers.delete(socket.id);
        
        // Notify room
        socket.to(userInfo.roomId).emit('userLeft', {
          username: userInfo.username,
          message: `${userInfo.username} left the chat`
        });

        // Update online users list
        const roomUsers = Array.from(onlineUsers.values())
          .filter(u => u.roomId === userInfo.roomId)
          .map(u => ({ username: u.username, userId: u.user }));
        
        io.to(userInfo.roomId).emit('onlineUsers', roomUsers);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
    
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://${localIP}:${PORT}`);
  console.log(`Frontend should be available at http://${localIP}:5173`);
});
