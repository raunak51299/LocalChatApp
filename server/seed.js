const mongoose = require('mongoose');
require('dotenv').config();

const Room = require('./models/Room');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/localchat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedDatabase() {
  try {
    // Clear existing data
    await Room.deleteMany({});
    await User.deleteMany({});
    
    // Create default rooms
    const defaultRooms = [
      {
        name: 'General',
        description: 'General discussion for everyone'
      },
      {
        name: 'Random',
        description: 'Random conversations and fun topics'
      },
      {
        name: 'Tech Talk',
        description: 'Technology and programming discussions'
      }
    ];

    const createdRooms = await Room.insertMany(defaultRooms);
    console.log('✅ Default rooms created:', createdRooms.map(r => r.name));

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      isAdmin: true,
      isOnline: false
    });
    await adminUser.save();
    console.log('✅ Admin user created');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
