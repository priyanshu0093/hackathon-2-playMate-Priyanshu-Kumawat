import User from '../models/User.js';
import Match from '../models/Match.js';

/**
 * GET /api/users/players
 * Discover players based on city, sport, skill level, position, availability
 */
export const getPlayers = async (req, res, next) => {
  try {
    const { city, sport, skillLevel, position, q } = req.query;

    const query = { role: 'player' };

    if (city) {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (sport) {
      query.preferredSports = { $in: [new RegExp(`^${sport.trim()}$`, 'i')] };
    }

    if (skillLevel && skillLevel !== 'All Levels') {
      query.skillLevel = skillLevel;
    }

    if (position) {
      query.$or = [
        { playingRole: new RegExp(position.trim(), 'i') },
        { preferredPositions: { $in: [new RegExp(position.trim(), 'i')] } }
      ];
    }

    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = query.$or || [];
      query.$or.push({ name: regex }, { bio: regex });
    }

    const players = await User.find(query)
      .select('-password')
      .sort({ rating: -1, matchesPlayed: -1 })
      .limit(50);

    res.json(players.map((p) => p.toSafeObject()));
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
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    // Fetch user's match history
    const userMatches = await Match.find({
      $or: [
        { host: user._id },
        { 'participants.user': user._id }
      ]
    })
      .sort({ date: -1 })
      .limit(10);

    const safeUser = user.toSafeObject();
    safeUser.recentMatches = userMatches.map((m) => m.toJSON());

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
    const matches = await Match.find({
      $or: [
        { host: req.user.id },
        { 'participants.user': req.user.id }
      ]
    }).sort({ date: 1, time: 1 });

    const today = new Date().toISOString().split('T')[0];
    const upcoming = [];
    const completed = [];

    for (const m of matches) {
      const json = m.toJSON();
      if (m.status === 'Completed' || m.date < today) {
        completed.push(json);
      } else {
        upcoming.push(json);
      }
    }

    res.json({
      success: true,
      upcoming,
      completed,
      total: matches.length
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

  // Construct URL accessible by frontend
  const fileUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
};

