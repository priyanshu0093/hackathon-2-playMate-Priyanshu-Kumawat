import prisma from '../config/prisma.js';
import { formatChatMessage } from '../utils/formatters.js';

/**
 * GET /api/chats
 * List active match chats for the authenticated user
 */
export const getMatchChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const allMatches = await prisma.match.findMany({
      orderBy: { updatedAt: 'desc' }
    });

    const userMatches = allMatches.filter((m) => {
      if (m.hostId === userId) return true;
      const participants = Array.isArray(m.participants) ? m.participants : [];
      return participants.some((p) => p.user === userId || String(p.user) === String(userId));
    });

    const chatList = [];

    for (const match of userMatches) {
      const messages = await prisma.chatMessage.findMany({
        where: { matchId: match.id },
        orderBy: { createdAt: 'asc' },
        take: 50
      });

      const sportEmoji =
        match.sport === 'Football'
          ? '⚽'
          : match.sport === 'Cricket'
          ? '🏏'
          : match.sport === 'Badminton'
          ? '🏸'
          : '🏆';

      const participants = Array.isArray(match.participants) ? match.participants : [];

      chatList.push({
        id: `chat_${match.id}`,
        matchId: match.id,
        title: `${match.title} ${sportEmoji}`,
        subtitle: `${participants.length} players active`,
        avatar: match.coverImage || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80',
        messages: messages.map((m) => {
          const formatted = formatChatMessage(m);
          formatted.isMe = m.senderId === userId;
          return formatted;
        })
      });
    }

    res.json(chatList);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/chats/:matchId
 * Messages for a specific match chat (Participant/Host authorization strictly checked)
 */
export const getMatchMessages = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const participants = Array.isArray(match.participants) ? match.participants : [];
    const isHost = match.hostId === userId;
    const isParticipant = participants.some((p) => p.user === userId || String(p.user) === String(userId));

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You must be a registered match participant to view this chat.'
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(
      messages.map((m) => {
        const formatted = formatChatMessage(m);
        formatted.isMe = m.senderId === userId;
        return formatted;
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/chats/:matchId
 * Post a new message to match chat
 */
export const postMatchMessage = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const { text, message } = req.body;
    const msgText = (text || message || '').trim();

    if (!msgText) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const userId = req.user.id;
    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const participants = Array.isArray(match.participants) ? match.participants : [];
    const isHost = match.hostId === userId;
    const isParticipant = participants.some((p) => p.user === userId || String(p.user) === String(userId));

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only confirmed match participants can chat.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const chatMsg = await prisma.chatMessage.create({
      data: {
        matchId: match.id,
        senderId: user ? user.id : userId,
        senderName: user ? user.name : req.user.name,
        senderAvatar: user ? user.avatar : '',
        text: msgText
      }
    });

    const formatted = formatChatMessage(chatMsg);
    formatted.isMe = true;

    res.status(201).json(formatted);
  } catch (error) {
    next(error);
  }
};
