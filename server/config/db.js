const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap';
    const conn = await mongoose.connect(connStr);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`
⚠️  DATABASE WARNING: Could not connect to MongoDB at: ${process.env.MONGO_URI || 'mongodb://localhost:27017/skillswap'}
Reason: ${error.message}
Please start your local MongoDB database or set a valid MONGO_URI in server/.env.
The server will continue booting so you can review code compiling, but database features will throw exceptions until connected.
    `);
  }
};

module.exports = connectDB;
