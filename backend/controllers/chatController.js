import ChatMessage from '../models/ChatMessage.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

/**
 * GET /api/chats
 * List active match chats for the authenticated user
 */
export const getMatchChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find matches user is participating in or hosting
    const userMatches = await Match.find({
      $or: [{ host: userId }, { 'participants.user': userId }]
    }).sort({ updatedAt: -1 });

    const chatList = [];

    for (const match of userMatches) {
      const messages = await ChatMessage.find({ match: match._id })
        .sort({ createdAt: 1 })
        .limit(50);

      const sportEmoji =
        match.sport === 'Football'
          ? '⚽'
          : match.sport === 'Cricket'
          ? '🏏'
          : match.sport === 'Badminton'
          ? '🏸'
          : '🏆';

      chatList.push({
        id: `chat_${match._id}`,
        matchId: match._id.toString(),
        title: `${match.title} ${sportEmoji}`,
        subtitle: `${match.participants.length} players active`,
        avatar: match.coverImage || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=200&q=80',
        messages: messages.map((m) => {
          const json = m.toJSON();
          json.isMe = m.sender.toString() === userId;
          return json;
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

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const isHost = match.host.toString() === userId;
    const isParticipant = match.participants.some((p) => p.user.toString() === userId);

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You must be a registered match participant to view this chat.'
      });
    }

    const messages = await ChatMessage.find({ match: matchId }).sort({ createdAt: 1 });

    res.json(
      messages.map((m) => {
        const json = m.toJSON();
        json.isMe = m.sender.toString() === userId;
        return json;
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
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const isHost = match.host.toString() === userId;
    const isParticipant = match.participants.some((p) => p.user.toString() === userId);

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only confirmed match participants can chat.'
      });
    }

    const user = await User.findById(userId);

    const chatMsg = await ChatMessage.create({
      match: match._id,
      sender: user._id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: msgText
    });

    const json = chatMsg.toJSON();
    json.isMe = true;

    res.status(201).json(json);
  } catch (error) {
    next(error);
  }
};

