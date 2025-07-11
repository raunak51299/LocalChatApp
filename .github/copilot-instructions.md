# Copilot Instructions for Local Chat Application

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a local chat application that runs on a Node.js/Express server with Socket.IO for real-time communication, React with Vite for the frontend, and MongoDB for data persistence.

## Architecture
- **Frontend**: React + Vite (port 5173)
- **Backend**: Node.js + Express + Socket.IO (port 3001)
- **Database**: MongoDB
- **Real-time**: Socket.IO for WebSocket communication

## Key Features
- Real-time messaging with Socket.IO
- Username assignment and user management
- Chat history storage in MongoDB
- Typing indicators and online users list
- Admin control panel (kick users, clear messages)
- QR code generation for easy mobile access
- Local network access (no internet required)

## Development Guidelines
- Use ES6+ features and modern React patterns
- Implement proper error handling for network and database operations
- Ensure responsive design for mobile and desktop
- Follow REST API conventions for HTTP endpoints
- Use Socket.IO events for real-time features
- Implement proper validation for user inputs
- Use environment variables for configuration

## File Structure
- `/src` - React frontend source code
- `/server` - Node.js backend server
- `/server/models` - MongoDB models
- `/server/routes` - Express routes
- `/server/middleware` - Custom middleware
