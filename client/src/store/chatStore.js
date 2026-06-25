import { create } from 'zustand';
import axios from 'axios';
import { io } from 'socket.io-client';

export const useChatStore = create((set, get) => ({
  chats: [],
  messages: [],
  activeRoomId: null,
  activePartner: null,
  socket: null,
  onlineUsers: [],
  typingStatus: {}, // roomId -> { username, isTyping }
  notifications: [],
  unreadNotificationsCount: 0,

  initSocket: (userId, onNotificationReceived) => {
    if (get().socket) return;

    // Establish WebSocket Connection
    const socket = io(import.meta.env.VITE_BACKEND_URL || window.location.origin, {
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Socket connected to backend:', socket.id);
      socket.emit('registerUser', userId);
    });

    socket.on('onlineUsers', (users) => {
      set({ onlineUsers: users });
    });

    socket.on('receiveMessage', (message) => {
      const { activeRoomId, messages, chats, fetchChatsList } = get();
      
      // Append if it belongs to current active chat room
      if (message.roomId === activeRoomId) {
        set({ messages: [...messages, message] });
      }
      
      // Refresh chats list to display the last message preview
      fetchChatsList();
    });

    socket.on('userTyping', ({ userId, username }) => {
      const { activeRoomId } = get();
      set((state) => ({
        typingStatus: {
          ...state.typingStatus,
          [activeRoomId]: { username, isTyping: true }
        }
      }));
    });

    socket.on('userStopTyping', ({ userId }) => {
      const { activeRoomId } = get();
      set((state) => ({
        typingStatus: {
          ...state.typingStatus,
          [activeRoomId]: null
        }
      }));
    });

    socket.on('newNotification', (notification) => {
      // Prepend to notification array
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadNotificationsCount: state.unreadNotificationsCount + 1
      }));
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchChatsList: async () => {
    try {
      const res = await axios.get('/api/chats');
      set({ chats: res.data.chats });
    } catch (error) {
      console.error('Error fetching chats:', error.message);
    }
  },

  fetchMessages: async (roomId) => {
    try {
      const res = await axios.get(`/api/chats/${roomId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  },

  joinRoom: (roomId, partner) => {
    const { socket, activeRoomId } = get();
    
    set({ activeRoomId: roomId, activePartner: partner, messages: [] });
    get().fetchMessages(roomId);

    if (socket) {
      socket.emit('joinRoom', roomId);
    }
  },

  sendMessage: async (text) => {
    const { activeRoomId, activePartner, messages, socket } = get();
    if (!activeRoomId || !activePartner) return;

    try {
      const res = await axios.post('/api/chats/message', {
        receiverId: activePartner._id,
        text,
        roomId: activeRoomId
      });

      const messageObj = res.data.message;
      set({ messages: [...messages, messageObj] });

      // Emit on socket for immediate client updates
      if (socket) {
        socket.emit('sendMessage', {
          ...messageObj,
          senderName: useChatStore.getState().username // Temporary, backend handles senderName fallback if needed
        });
      }

      get().fetchChatsList();
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  },

  sendTyping: (isTyping) => {
    const { socket, activeRoomId } = get();
    if (!socket || !activeRoomId) return;

    const authUser = JSON.parse(localStorage.getItem('user') || 'null') || {};
    if (isTyping) {
      socket.emit('typing', { roomId: activeRoomId, username: authUser.name });
    } else {
      socket.emit('stopTyping', { roomId: activeRoomId });
    }
  },

  fetchNotifications: async () => {
    try {
      const res = await axios.get('/api/users/notifications');
      const unread = res.data.notifications.filter(n => !n.read).length;
      set({ notifications: res.data.notifications, unreadNotificationsCount: unread });
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  },

  markNotificationsAsRead: async () => {
    try {
      await axios.put('/api/users/notifications/read');
      set((state) => ({
        unreadNotificationsCount: 0,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      }));
    } catch (error) {
      console.error('Error marking notifications read:', error.message);
    }
  }
}));
