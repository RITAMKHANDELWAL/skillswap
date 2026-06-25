const { Server } = require('socket.io');

let io;
const activeUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost',
        'capacitor://localhost',
        'https://localhost'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register active user
    socket.on('registerUser', (userId) => {
      if (userId) {
        activeUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        io.emit('onlineUsers', Array.from(activeUsers.keys()));
      }
    });

    // Join direct message room
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Direct message
    socket.on('sendMessage', (message) => {
      // Message structure should match Message schema: { sender, receiver, text, createdAt, roomId }
      const { roomId } = message;
      socket.to(roomId).emit('receiveMessage', message);
      
      // Also send notification if recipient is online but not in room
      const receiverSocketId = activeUsers.get(message.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('newNotification', {
          type: 'message',
          title: 'New Message',
          message: `${message.senderName || 'Someone'} sent you a message.`,
          data: message
        });
      }
    });

    // Typing status
    socket.on('typing', ({ roomId, userId, username }) => {
      socket.to(roomId).emit('userTyping', { userId, username });
    });

    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userStopTyping', { userId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} unregistered`);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(activeUsers.keys()));
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const sendRealtimeNotification = (userId, notification) => {
  if (io) {
    const socketId = activeUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('newNotification', notification);
    }
  }
};

module.exports = {
  initSocket,
  getIo,
  sendRealtimeNotification
};
