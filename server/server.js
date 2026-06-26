process.on("uncaughtException", (err) => {
  console.error("========== UNCAUGHT EXCEPTION ==========");
  console.error(err);
  console.error(err.stack);
});

process.on("unhandledRejection", (err) => {
  console.error("========== UNHANDLED REJECTION ==========");
  console.error(err);
});

const http = require('http');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// Database connection
connectDB();

// HTTP server wrapper for Socket.io integration
const server = http.createServer(app);

// Initialize Socket.ios
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`SkillSwap Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

