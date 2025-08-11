const mongoose = require('mongoose');
const Message = require('./models/Message');
const User = require('./models/User');
require('dotenv').config();

async function clearMessagesAndUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localchat');
    
    console.log('🗑️  Clearing messages...');
    const deletedMessages = await Message.deleteMany({});
    console.log(`✅ Deleted ${deletedMessages.deletedCount} messages`);
    
    console.log('🗑️  Clearing users...');
    const deletedUsers = await User.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.deletedCount} users`);
    
    console.log('🎉 Chat history cleared! Rooms preserved.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

clearMessagesAndUsers();
