# 🏠 Local Chat App

A feature-rich local network chat application that allows devices on the same Wi-Fi network to communicate in real-time without requiring an internet connection.

## ✨ Features

- 🔄 **Real-time messaging** with Socket.IO WebSockets
- 🏠 **Local network only** - no internet required
- 👥 **Multiple chat rooms** with room creation
- 📱 **QR code generation** for easy mobile access
- 👤 **Username assignment** and user management
- 💾 **Chat history storage** in MongoDB
- ⌨️ **Typing indicators** for active conversations
- 👥 **Online users list** with real-time updates
- ⚙️ **Admin control panel** (kick users, clear messages)
- 📱 **Responsive design** for desktop and mobile
- 🎨 **Modern UI** with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Install frontend dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

3. **Start MongoDB**
   - If using local MongoDB: `mongod`
   - If using MongoDB Atlas: Update the connection string in `server/.env`

4. **Seed the database** (optional - creates default rooms)
   ```bash
   cd server
   npm run seed
   cd ..
   ```

5. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

6. **Start the frontend** (in a new terminal)
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open your browser and go to `http://localhost:5173`
   - The server will automatically detect your local IP address
   - Share the IP address with other devices on your network

## 📱 Mobile Access

1. Click the "📱 Show QR Code" button on the main screen
2. Scan the QR code with your mobile device
3. Or manually visit the displayed URL on your mobile browser
4. Ensure your mobile device is connected to the same Wi-Fi network

## 🛠️ Configuration

### Environment Variables (server/.env)

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/localchat
NODE_ENV=development
```

### Default Ports

- **Frontend (React + Vite)**: http://localhost:5173
- **Backend (Node.js + Express)**: http://localhost:3001
- **MongoDB**: mongodb://localhost:27017

## 🎮 Usage

### Joining a Chat Room

1. Enter your desired username
2. Select an existing room or create a new one
3. Click "Join Chat" to enter the room

### Admin Features

1. Click the "⚙️ Admin" button (appears after joining)
2. **Kick Users**: Select a user and click "🚫 Kick User"
3. **Clear Messages**: Click "🗑️ Clear All Messages" to delete chat history

### Creating New Rooms

1. Click "Create New Room" on the join screen
2. Enter a room name
3. Click "Create Room"

## 🏗️ Project Structure

```
LocalChatApp/
├── src/                          # Frontend React source
│   ├── components/              # React components
│   │   ├── JoinForm.jsx        # Room joining interface
│   │   ├── ChatRoom.jsx        # Main chat interface
│   │   ├── MessageList.jsx     # Message display
│   │   ├── MessageInput.jsx    # Message input with typing
│   │   ├── OnlineUsers.jsx     # Online users sidebar
│   │   ├── TypingIndicator.jsx # Typing animation
│   │   ├── QRCodeDisplay.jsx   # QR code for mobile
│   │   ├── AdminPanel.jsx      # Admin controls
│   │   └── *.css              # Component styles
│   ├── App.jsx                 # Main app component
│   └── main.jsx               # App entry point
├── server/                      # Backend Node.js source
│   ├── models/                 # MongoDB models
│   │   ├── User.js            # User schema
│   │   ├── Message.js         # Message schema
│   │   └── Room.js            # Room schema
│   ├── index.js               # Express server with Socket.IO
│   ├── seed.js                # Database seeding script
│   └── .env                   # Environment variables
├── package.json               # Frontend dependencies
└── README.md                  # Project documentation
```

## 🔧 Technical Details

### Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express + Socket.IO
- **Database**: MongoDB with Mongoose
- **Real-time**: WebSocket connections via Socket.IO
- **Styling**: Custom CSS with modern design
- **QR Codes**: Server-side generation with qrcode library

### Socket Events

#### Client → Server
- `join` - Join a chat room
- `sendMessage` - Send a message
- `typing` - Typing indicator
- `kickUser` - Admin: kick a user
- `clearMessages` - Admin: clear chat history

#### Server → Client
- `newMessage` - New message received
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `onlineUsers` - Updated users list
- `typingUsers` - Typing users list
- `messagesCleared` - Messages cleared notification
- `kicked` - User was kicked

### API Endpoints

- `GET /api/qr` - Generate QR code for mobile access
- `GET /api/rooms` - Get available chat rooms
- `POST /api/rooms` - Create a new chat room
- `GET /api/rooms/:roomId/messages` - Get chat history

## 🚀 Production Deployment

### Local Network Deployment

1. **Update the frontend Socket.IO connection**:
   ```javascript
   // In src/App.jsx, replace:
   const socket = io('http://localhost:3001');
   // With your server's local IP:
   const socket = io('http://YOUR_LOCAL_IP:3001');
   ```

2. **Build the frontend**:
   ```bash
   npm run build
   ```

3. **Start the production server**:
   ```bash
   cd server
   npm start
   ```

## 🐛 Troubleshooting

### Common Issues

1. **Cannot connect to MongoDB**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in `server/.env`

2. **Devices can't access the chat**
   - Verify all devices are on the same Wi-Fi network
   - Check firewall settings (ports 3001 and 5173)
   - Use the correct local IP address

3. **QR code not working**
   - Ensure the server is running
   - Check that the local IP is correctly detected

4. **Messages not appearing**
   - Check browser console for errors
   - Verify Socket.IO connection status
   - Restart both frontend and backend

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔮 Future Enhancements

- [ ] File sharing capabilities
- [ ] Voice messages
- [ ] Message encryption
- [ ] User profiles with avatars
- [ ] Private messaging
- [ ] Chat room passwords
- [ ] Message reactions/emojis
- [ ] Dark mode theme
- [ ] Progressive Web App (PWA) support
