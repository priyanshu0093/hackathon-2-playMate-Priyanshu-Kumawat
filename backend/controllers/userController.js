import prisma from '../config/prisma.js';
import { formatUser, formatMatch } from '../utils/formatters.js';

/**
 * GET /api/users/players
 * Discover players based on city, sport, skill level, position, availability
 */
export const getPlayers = async (req, res, next) => {
  try {
    const { city, sport, skillLevel, position, q } = req.query;

    const where = { role: 'player' };

    if (city && city !== 'all') {
      where.city = { equals: city.trim(), mode: 'insensitive' };
    }

    if (skillLevel && skillLevel !== 'All Levels') {
      where.skillLevel = skillLevel;
    }

    let players = await prisma.user.findMany({
      where,
      orderBy: [{ rating: 'desc' }, { matchesPlayed: 'desc' }],
      take: 100
    });

    if (sport && sport !== 'all') {
      const sportLower = sport.trim().toLowerCase();
      players = players.filter((p) => {
        const sports = Array.isArray(p.preferredSports) ? p.preferredSports : [];
        return sports.some((s) => String(s).toLowerCase().includes(sportLower));
      });
    }

    if (position) {
      const posLower = position.trim().toLowerCase();
      players = players.filter((p) => {
        const matchesRole = p.playingRole && p.playingRole.toLowerCase().includes(posLower);
        const positions = Array.isArray(p.preferredPositions) ? p.preferredPositions : [];
        const matchesPos = positions.some((pos) => String(pos).toLowerCase().includes(posLower));
        return matchesRole || matchesPos;
      });
    }

    if (q) {
      const qLower = q.trim().toLowerCase();
      players = players.filter((p) => {
        const nameMatch = p.name && p.name.toLowerCase().includes(qLower);
        const bioMatch = p.bio && p.bio.toLowerCase().includes(qLower);
        return nameMatch || bioMatch;
      });
    }

    res.json(players.slice(0, 50).map(formatUser));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Fetch public player profile with statistics and match history
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    // Fetch user's match history
    const allMatches = await prisma.match.findMany({
      orderBy: { date: 'desc' },
      take: 100
    });

    const userMatches = allMatches.filter((m) => {
      if (m.hostId === user.id) return true;
      const participants = Array.isArray(m.participants) ? m.participants : [];
      return participants.some((p) => p.user === user.id || String(p.user) === String(user.id));
    }).slice(0, 10);

    const safeUser = formatUser(user);
    safeUser.recentMatches = userMatches.map(formatMatch);

    res.json(safeUser);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me/matches
 * Get authenticated player's upcoming and completed matches
 */
export const getMyMatches = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const allMatches = await prisma.match.findMany({
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });

    const userMatches = allMatches.filter((m) => {
      if (m.hostId === userId) return true;
      const participants = Array.isArray(m.participants) ? m.participants : [];
      return participants.some((p) => p.user === userId || String(p.user) === String(userId));
    });

    const today = new Date().toISOString().split('T')[0];
    const upcoming = [];
    const completed = [];

    for (const m of userMatches) {
      const formatted = formatMatch(m);
      if (m.status === 'Completed' || m.date < today) {
        completed.push(formatted);
      } else {
        upcoming.push(formatted);
      }
    }

    res.json({
      success: true,
      upcoming,
      completed,
      total: userMatches.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/upload
 * Secure image upload endpoint (avatar, turf photos)
 */
export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
};
