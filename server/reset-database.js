const mongoose = require('mongoose');
require('dotenv').config();

async function resetDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localchat');
    
    console.log('🗑️  Dropping existing database...');
    await mongoose.connection.db.dropDatabase();
    
    console.log('✅ Database cleared successfully');
    console.log('🌱 Run "node seed.js" to restore default rooms');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

resetDatabase();
