const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/community_help_hub';

  try {
    console.log(`Attempting connection to MongoDB at: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick fallback if local daemon is not running
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (err) {
    console.warn('⚠️ Local MongoDB not detected. Launching in-memory MongoDB instance for zero-dependency hackathon demo...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Embedded In-Memory MongoDB running at: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr.message);
      process.exit(1);
    }
  }

  // Auto-seed if database is brand new
  try {
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding initial realistic demo dataset...');
      const { seedData } = require('../seeds/seedData');
      await seedData();
      console.log('✅ Auto-seeding complete.');
    }
  } catch (seedErr) {
    console.warn('Note on auto-seed:', seedErr.message);
  }
};

module.exports = connectDB;
