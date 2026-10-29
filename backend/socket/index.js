import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';
import Match from '../models/Match.js';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';

let ioInstance = null;

export const initSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    let token = null;

    // Check handshake auth
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    // Check cookies
    else if (socket.handshake.headers.cookie) {
      const match = socket.handshake.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      // Allow connection but mark as anonymous
      socket.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    // If authenticated, join user's private notification channel
    if (socket.user && socket.user.id) {
      socket.join(`user_${socket.user.id}`);
    }

    // Join match chat room with authorization check
    socket.on('join_match_chat', async ({ matchId }, callback) => {
      if (!socket.user) {
        if (callback) callback({ error: 'Authentication required to join match chat.' });
        return;
      }

      try {
        const match = await Match.findById(matchId);
        if (!match) {
          if (callback) callback({ error: 'Match not found.' });
          return;
        }

        const isHost = match.host.toString() === socket.user.id;
        const isParticipant = match.participants.some(
          (p) => p.user.toString() === socket.user.id
        );

        if (!isHost && !isParticipant) {
          if (callback) callback({ error: 'Access denied: not a registered match participant.' });
          return;
        }

        socket.join(`match_${matchId}`);
        if (callback) callback({ success: true, room: `match_${matchId}` });
      } catch (err) {
        if (callback) callback({ error: 'Failed to join match chat.' });
      }
    });

    // Leave match chat room
    socket.on('leave_match_chat', ({ matchId }) => {
      socket.leave(`match_${matchId}`);
    });

    // Send real-time chat message
    socket.on('send_chat_message', async ({ matchId, text }, callback) => {
      if (!socket.user) {
        if (callback) callback({ error: 'Authentication required.' });
        return;
      }

      try {
        const match = await Match.findById(matchId);
        if (!match) {
          if (callback) callback({ error: 'Match not found.' });
          return;
        }

        const isHost = match.host.toString() === socket.user.id;
        const isParticipant = match.participants.some(
          (p) => p.user.toString() === socket.user.id
        );

        if (!isHost && !isParticipant) {
          if (callback) callback({ error: 'Access denied: not a registered match participant.' });
          return;
        }

        const user = await User.findById(socket.user.id);
        const chatMsg = await ChatMessage.create({
          match: match._id,
          sender: user._id,
          senderName: user.name,
          senderAvatar: user.avatar,
          text: text.trim()
        });

        const json = chatMsg.toJSON();

        // Broadcast to everyone in the room
        io.to(`match_${matchId}`).emit('new_chat_message', {
          matchId,
          message: json
        });

        if (callback) callback({ success: true, message: json });
      } catch (err) {
        if (callback) callback({ error: err.message });
      }
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });

  ioInstance = io;
  return io;
};

export const getIO = () => ioInstance;

/**
 * Emit real-time notification to a specific user
 */
export const emitNotification = (userId, notification) => {
  if (ioInstance && userId) {
    ioInstance.to(`user_${userId.toString()}`).emit('new_notification', notification);
  }
};

