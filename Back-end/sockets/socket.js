const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const onlineUsers = new Map();

const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socketId);
};

const removeOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) return;
  onlineUsers.get(userId).delete(socketId);
  if (onlineUsers.get(userId).size === 0) {
    onlineUsers.delete(userId);
  }
};

const isUserOnline = (userId) => onlineUsers.has(userId);

const getConversationRoom = (customerId, restaurantId) =>
  `conv_${customerId}_${restaurantId}`;

const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('التوكن مطلوب للاتصال'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let account;
      if (decoded.role === 'restaurant') {
        account = await Restaurant.findById(decoded.id);
      } else {
        account = await User.findById(decoded.id);
      }

      if (!account) return next(new Error('الحساب غير موجود'));

      socket.userId = account._id.toString();
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('فشل التحقق من الهوية'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId} (${socket.userRole})`);

    const wasAlreadyOnline = isUserOnline(socket.userId);
    addOnlineUser(socket.userId, socket.id);

    socket.join(`user_${socket.userId}`);

    if (!wasAlreadyOnline) {
      socket.broadcast.emit('userStatusChanged', {
        userId: socket.userId,
        isOnline: true,
      });
    }

    socket.on('joinConversation', (partnerId) => {
      const room =
        socket.userRole === 'restaurant'
          ? getConversationRoom(partnerId, socket.userId)
          : getConversationRoom(socket.userId, partnerId);
      socket.join(room);
    });

    socket.on('leaveConversation', (partnerId) => {
      const room =
        socket.userRole === 'restaurant'
          ? getConversationRoom(partnerId, socket.userId)
          : getConversationRoom(socket.userId, partnerId);
      socket.leave(room);
    });

    socket.on('checkOnlineStatus', (partnerId, callback) => {
      if (typeof callback === 'function') {
        callback({ isOnline: isUserOnline(partnerId) });
      }
    });

    socket.on('typing', (partnerId) => {
      const room =
        socket.userRole === 'restaurant'
          ? getConversationRoom(partnerId, socket.userId)
          : getConversationRoom(socket.userId, partnerId);
      socket.to(room).emit('typing', { userId: socket.userId });
    });

    socket.on('stopTyping', (partnerId) => {
      const room =
        socket.userRole === 'restaurant'
          ? getConversationRoom(partnerId, socket.userId)
          : getConversationRoom(socket.userId, partnerId);
      socket.to(room).emit('stopTyping', { userId: socket.userId });
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      removeOnlineUser(socket.userId, socket.id);

      if (!isUserOnline(socket.userId)) {
        socket.broadcast.emit('userStatusChanged', {
          userId: socket.userId,
          isOnline: false,
        });
      }
    });
  });
};

const emitToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conv_${conversationId}`).emit(event, data);
};

module.exports = {
  initializeSocket,
  emitToUser,
  emitToConversation,
  isUserOnline,
  onlineUsers,
};