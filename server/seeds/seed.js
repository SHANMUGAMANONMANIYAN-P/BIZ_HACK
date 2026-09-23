require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedData } = require('./seedData');

const runSeed = async () => {
  try {
    console.log('Connecting to database for manual seed...');
    await connectDB();
    console.log('Running seeder script...');
    await seedData();
    console.log('🌱 Seeding process finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeder failed:', err);
    process.exit(1);
  }
};

runSeed();
