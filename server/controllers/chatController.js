const Message = require('../models/Message');
const User = require('../models/User');

exports.getChatMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    // Verify user belongs to the room (roomId consists of both user ids joined by hyphens)
    const members = roomId.split('--');
    if (!members.includes(req.user.id)) {
      return res.status(401).json({ success: false, message: 'Unauthorized chat history access' });
    }

    const messages = await Message.find({ roomId }).sort('createdAt');
    
    // Mark messages sent to this user as read
    await Message.updateMany({ roomId, receiver: req.user.id, read: false }, { read: true });

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

exports.getChatsList = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all unique rooms the user participated in
    const uniqueRoomIds = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).distinct('roomId');

    const chats = [];

    for (const roomId of uniqueRoomIds) {
      // Find recipient user
      const members = roomId.split('--');
      const partnerId = members.find(id => id !== userId);
      
      if (!partnerId) continue;

      const partner = await User.findById(partnerId).select('name email profilePicture bio skillsOffered skillsWanted online');
      if (!partner) continue;

      const lastMessage = await Message.findOne({ roomId }).sort('-createdAt');
      const unreadCount = await Message.countDocuments({ roomId, receiver: userId, read: false });

      chats.push({
        roomId,
        partner,
        lastMessage,
        unreadCount
      });
    }

    // Sort by last message timestamp
    chats.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

// Expose static helper to save new messages from websocket or http requests
exports.saveDirectMessage = async (senderId, receiverId, text, roomId) => {
  try {
    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      roomId
    });
    return msg;
  } catch (error) {
    console.error('Error saving direct message:', error.message);
    throw error;
  }
};
