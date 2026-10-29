import Match from '../models/Match.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ChatMessage from '../models/ChatMessage.js';

/**
 * GET /api/matches
 * Search and filter matches
 */
export const getMatches = async (req, res, next) => {
  try {
    const { sport, city, date, skillLevel, maxPrice, spotsAvailable, q } = req.query;

    const query = { status: { $ne: 'Cancelled' } };

    if (sport && sport !== 'all') {
      query.sport = new RegExp(`^${sport.trim()}$`, 'i');
    }

    if (city && city !== 'all') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (date) {
      query.date = date;
    }

    if (skillLevel && skillLevel !== 'All Levels') {
      query.skillLevel = { $in: [skillLevel, 'All Levels'] };
    }

    if (maxPrice) {
      query.feePerPlayer = { $lte: Number(maxPrice) };
    }

    if (spotsAvailable === 'true') {
      query.status = 'Open';
    }

    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: regex },
        { location: regex },
        { venue: regex },
        { description: regex }
      ];
    }

    const matches = await Match.find(query).sort({ date: 1, time: 1 });

    res.json(matches.map((m) => m.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matches/:id
 * Fetch single match with details
 */
export const getMatchById = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const json = match.toJSON();

    // Attach requests if user is the host
    if (req.user && match.host.toString() === req.user.id) {
      json.joinRequests = match.joinRequests;
    } else if (req.user) {
      // Show only current user's request status
      json.myRequest = match.joinRequests.find(
        (r) => r.user.toString() === req.user.id
      );
    }

    res.json(json);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches
 * Create a new match with host auto-enrolled
 */
export const createMatch = async (req, res, next) => {
  try {
    const {
      title,
      sport,
      description,
      date,
      time,
      duration,
      city,
      location,
      venue,
      venueId,
      maxPlayers,
      skillLevel,
      visibility,
      requiresApproval,
      estimatedCost,
      feePerPlayer,
      coverImage,
      rules
    } = req.body;

    if (!title || !sport || !date || !time || !city) {
      return res.status(400).json({
        success: false,
        error: 'Title, sport, date, time, and city are required fields.'
      });
    }

    const hostUser = await User.findById(req.user.id);
    const capacity = Number(maxPlayers) || 10;
    const estCost = Number(estimatedCost) || 0;
    const perPlayerFee = Number(feePerPlayer) || (estCost > 0 ? Math.ceil(estCost / capacity) : 0);

    const match = await Match.create({
      title: title.trim(),
      sport: sport.trim(),
      description: description || '',
      date,
      time,
      duration: duration || '1.5 hrs',
      city: city.trim(),
      location: location ? location.trim() : (venue || `${city} Sports Ground`),
      venue: venue || 'Local Sports Venue',
      venueId: venueId || null,
      host: req.user.id,
      hostName: hostUser ? hostUser.name : req.user.name,
      hostAvatar: hostUser ? hostUser.avatar : '',
      maxPlayers: capacity,
      skillLevel: skillLevel || 'All Levels',
      visibility: visibility || 'public',
      isPublic: visibility !== 'private',
      requiresApproval: !!requiresApproval,
      estimatedCost: estCost,
      feePerPlayer: perPlayerFee,
      coverImage: coverImage || '',
      rules: Array.isArray(rules) && rules.length ? rules : undefined,
      participants: [
        {
          user: req.user.id,
          name: hostUser ? hostUser.name : req.user.name,
          avatar: hostUser ? hostUser.avatar : '',
          role: hostUser?.playingRole || 'Host',
          skillLevel: hostUser?.skillLevel || 'Intermediate',
          team: 'Team A',
          attended: true,
          paymentStatus: 'Paid'
        }
      ]
    });

    // Auto-create initial welcoming chat message
    await ChatMessage.create({
      match: match._id,
      sender: req.user.id,
      senderName: match.hostName,
      senderAvatar: match.hostAvatar,
      text: `Match created! Welcome to ${match.title}. Discuss details, bibs, and coordination here.`
    });

    // Increment host statistics
    if (hostUser) {
      hostUser.stats = hostUser.stats || { played: 0, won: 0, lost: 0, hosted: 0, mvpCount: 0 };
      hostUser.stats.hosted = (hostUser.stats.hosted || 0) + 1;
      await hostUser.save();
    }

    res.status(201).json({
      success: true,
      message: 'Match created successfully.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/matches/:id
 * Edit match (Host only)
 */
export const updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can modify this match.' });
    }

    const updatable = [
      'title', 'description', 'date', 'time', 'duration', 'location',
      'venue', 'skillLevel', 'maxPlayers', 'visibility', 'rules', 'feePerPlayer'
    ];

    for (const field of updatable) {
      if (req.body[field] !== undefined) {
        match[field] = req.body[field];
      }
    }

    await match.save();

    res.json({
      success: true,
      message: 'Match updated successfully.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/matches/:id
 * Cancel match (Host only)
 */
export const cancelMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can cancel this match.' });
    }

    match.status = 'Cancelled';
    await match.save();

    // Notify all participants
    for (const p of match.participants) {
      if (p.user.toString() !== req.user.id) {
        await Notification.create({
          recipient: p.user,
          sender: req.user.id,
          senderName: match.hostName,
          type: 'booking_cancelled',
          title: 'Match Cancelled',
          message: `The match "${match.title}" has been cancelled by the host.`,
          actionLink: '/player/matches'
        });
      }
    }

    res.json({
      success: true,
      message: 'Match cancelled and participants notified.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/join
 * Player joins match or submits join request
 */
export const joinMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.status === 'Cancelled' || match.status === 'Completed') {
      return res.status(400).json({ success: false, error: `Cannot join a ${match.status.toLowerCase()} match.` });
    }

    const userId = req.user.id;

    // Check duplicate participation
    const alreadyJoined = match.participants.some((p) => p.user.toString() === userId);
    if (alreadyJoined) {
      return res.status(400).json({ success: false, error: 'You are already in this match roster.' });
    }

    // Check capacity
    if (match.participants.length >= match.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'This match is full. You can join the waitlist instead.',
        isFull: true
      });
    }

    const user = await User.findById(userId);

    // If match requires host approval
    if (match.requiresApproval) {
      const alreadyRequested = match.joinRequests.some((r) => r.user.toString() === userId && r.status === 'pending');
      if (alreadyRequested) {
        return res.status(400).json({ success: false, error: 'Join request already submitted.' });
      }

      match.joinRequests.push({
        user: userId,
        name: user.name,
        avatar: user.avatar,
        message: req.body.message || '',
        status: 'pending'
      });

      await match.save();

      // Notify host
      await Notification.create({
        recipient: match.host,
        sender: userId,
        senderName: user.name,
        type: 'join_request',
        title: 'New Join Request',
        message: `${user.name} requested to join "${match.title}".`,
        actionLink: `/player/matches/${match._id}`
      });

      return res.json({
        success: true,
        pendingApproval: true,
        message: 'Join request submitted for host approval.',
        match: match.toJSON()
      });
    }

    // Direct join
    match.participants.push({
      user: userId,
      name: user.name,
      avatar: user.avatar,
      role: user.playingRole || 'Player',
      skillLevel: user.skillLevel || 'Intermediate',
      team: 'Unassigned',
      attended: true,
      paymentStatus: 'Pending'
    });

    if (match.participants.length >= match.maxPlayers) {
      match.status = 'Full';
    } else {
      match.status = 'Open';
    }

    await match.save();

    // Notify host
    if (match.host.toString() !== userId) {
      await Notification.create({
        recipient: match.host,
        sender: userId,
        senderName: user.name,
        type: 'join_request',
        title: 'New Player Joined!',
        message: `${user.name} joined "${match.title}".`,
        actionLink: `/player/matches/${match._id}`
      });
    }

    res.json({
      success: true,
      message: 'Joined match successfully!',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/leave
 * Player leaves match with automated substitute promotion
 */
export const leaveMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const userId = req.user.id;

    if (match.host.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'Host cannot leave the match. You can cancel the match if needed.'
      });
    }

    const participantIdx = match.participants.findIndex((p) => p.user.toString() === userId);
    if (participantIdx === -1) {
      return res.status(400).json({ success: false, error: 'You are not in this match.' });
    }

    // Remove user
    match.participants.splice(participantIdx, 1);

    // Substitute promotion: If waitlist has players, promote the first in line
    let promotedPlayer = null;
    if (match.waitlist && match.waitlist.length > 0) {
      const nextInLine = match.waitlist.shift();
      const nextUser = await User.findById(nextInLine.user);

      if (nextUser) {
        match.participants.push({
          user: nextUser._id,
          name: nextUser.name,
          avatar: nextUser.avatar,
          role: nextUser.playingRole || 'Player',
          skillLevel: nextUser.skillLevel || 'Intermediate',
          team: 'Unassigned',
          attended: true,
          paymentStatus: 'Pending'
        });

        promotedPlayer = nextUser;

        // Notify the promoted substitute player
        await Notification.create({
          recipient: nextUser._id,
          type: 'request_approved',
          title: 'Promoted from Waitlist! 🏆',
          message: `A spot opened up! You are now in the active lineup for "${match.title}".`,
          actionLink: `/player/matches/${match._id}`
        });
      }
    }

    if (match.participants.length < match.maxPlayers) {
      match.status = 'Open';
    }

    await match.save();

    res.json({
      success: true,
      message: promotedPlayer
        ? `Left match. Promoted waitlisted substitute ${promotedPlayer.name}.`
        : 'Left match successfully.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/waitlist
 * Add player to waitlist
 */
export const joinWaitlist = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const userId = req.user.id;

    if (match.participants.some((p) => p.user.toString() === userId)) {
      return res.status(400).json({ success: false, error: 'You are already in the match roster.' });
    }

    if (match.waitlist.some((w) => w.user.toString() === userId)) {
      return res.status(400).json({ success: false, error: 'You are already on the waitlist.' });
    }

    const user = await User.findById(userId);

    match.waitlist.push({
      user: userId,
      name: user.name,
      avatar: user.avatar
    });

    await match.save();

    res.json({
      success: true,
      message: 'Added to waitlist. You will be automatically enrolled if a player leaves.',
      waitlistPosition: match.waitlist.length,
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/requests/:userId/approve
 * Host approves join request
 */
export const approveJoinRequest = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can approve requests.' });
    }

    const { userId } = req.params;
    const reqIndex = match.joinRequests.findIndex((r) => r.user.toString() === userId && r.status === 'pending');

    if (reqIndex === -1) {
      return res.status(404).json({ success: false, error: 'Pending join request not found.' });
    }

    if (match.participants.length >= match.maxPlayers) {
      return res.status(400).json({ success: false, error: 'Cannot approve: match is already at full capacity.' });
    }

    const approvedUser = await User.findById(userId);

    match.joinRequests[reqIndex].status = 'approved';
    match.participants.push({
      user: approvedUser._id,
      name: approvedUser.name,
      avatar: approvedUser.avatar,
      role: approvedUser.playingRole || 'Player',
      skillLevel: approvedUser.skillLevel || 'Intermediate',
      team: 'Unassigned',
      attended: true,
      paymentStatus: 'Pending'
    });

    if (match.participants.length >= match.maxPlayers) {
      match.status = 'Full';
    }

    await match.save();

    // Notify approved player
    await Notification.create({
      recipient: approvedUser._id,
      sender: req.user.id,
      senderName: match.hostName,
      type: 'request_approved',
      title: 'Join Request Approved! ⚽',
      message: `Your request to join "${match.title}" was approved by the host.`,
      actionLink: `/player/matches/${match._id}`
    });

    res.json({
      success: true,
      message: `${approvedUser.name} added to match roster.`,
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/requests/:userId/reject
 * Host rejects join request
 */
export const rejectJoinRequest = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can reject requests.' });
    }

    const { userId } = req.params;
    const reqIndex = match.joinRequests.findIndex((r) => r.user.toString() === userId && r.status === 'pending');

    if (reqIndex === -1) {
      return res.status(404).json({ success: false, error: 'Pending join request not found.' });
    }

    match.joinRequests[reqIndex].status = 'rejected';
    await match.save();

    // Notify rejected player
    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      senderName: match.hostName,
      type: 'request_rejected',
      title: 'Join Request Declined',
      message: `Your request to join "${match.title}" was declined by the host.`,
      actionLink: '/player/matches'
    });

    res.json({
      success: true,
      message: 'Join request declined.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/invite
 * Host invites player to match
 */
export const invitePlayer = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can invite players.' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Target player ID is required.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Player not found.' });
    }

    if (match.participants.some((p) => p.user.toString() === userId)) {
      return res.status(400).json({ success: false, error: 'Player is already in this match.' });
    }

    // Record invitation
    match.invitedPlayers = match.invitedPlayers || [];
    if (!match.invitedPlayers.some((i) => i.user.toString() === userId)) {
      match.invitedPlayers.push({ user: userId });
      await match.save();
    }

    // Create notification
    await Notification.create({
      recipient: userId,
      sender: req.user.id,
      senderName: match.hostName,
      type: 'match_invite',
      title: `Match Invite from ${match.hostName}`,
      message: `You were invited to join "${match.title}" on ${match.date} at ${match.time}.`,
      actionLink: `/player/matches/${match._id}`
    });

    res.json({
      success: true,
      message: `Invitation sent to ${targetUser.name}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/teams/balance
 * Deterministically balances participants into Team A & Team B
 */
export const balanceTeams = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can balance teams.' });
    }

    const participants = [...match.participants];
    if (participants.length < 2) {
      return res.status(400).json({ success: false, error: 'Need at least 2 players to form teams.' });
    }

    // Rank participants by skill level weight
    const skillWeights = {
      Professional: 4,
      Advanced: 3,
      Intermediate: 2,
      Beginner: 1,
      'All Levels': 2
    };

    participants.sort((a, b) => {
      const weightA = skillWeights[a.skillLevel] || 2;
      const weightB = skillWeights[b.skillLevel] || 2;
      return weightB - weightA;
    });

    // Snake draft distribution for balance: A, B, B, A, A, B...
    const teamA = [];
    const teamB = [];

    participants.forEach((p, idx) => {
      const cycle = Math.floor(idx / 2) % 2;
      if (cycle === 0) {
        if (idx % 2 === 0) {
          p.team = 'Team A';
          teamA.push(p.user);
        } else {
          p.team = 'Team B';
          teamB.push(p.user);
        }
      } else {
        if (idx % 2 === 0) {
          p.team = 'Team B';
          teamB.push(p.user);
        } else {
          p.team = 'Team A';
          teamA.push(p.user);
        }
      }
    });

    match.participants = participants;
    match.teams = {
      teamA: { name: 'Team Blue', score: 0, players: teamA },
      teamB: { name: 'Team Orange', score: 0, players: teamB }
    };

    await match.save();

    res.json({
      success: true,
      message: 'Teams balanced deterministically based on player skill levels.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/matches/:id/attendance
 * Confirm attendance records for participants
 */
export const updateAttendance = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can mark attendance.' });
    }

    const { attendance } = req.body; // e.g. [{ userId, attended: true }]
    if (Array.isArray(attendance)) {
      for (const item of attendance) {
        const participant = match.participants.find((p) => p.user.toString() === item.userId);
        if (participant) {
          participant.attended = !!item.attended;
        }
      }
      await match.save();
    }

    res.json({
      success: true,
      message: 'Attendance records updated.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/matches/:id/complete
 * Mark match complete, record scorecard and update player stats
 */
export const completeMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.host.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can record match results.' });
    }

    const { teamAScore, teamBScore, mvp, notes } = req.body;

    const aScore = Number(teamAScore) || 0;
    const bScore = Number(teamBScore) || 0;
    let winner = 'Draw';
    if (aScore > bScore) winner = 'Team A';
    else if (bScore > aScore) winner = 'Team B';

    match.status = 'Completed';
    match.result = {
      winner,
      teamAScore: aScore,
      teamBScore: bScore,
      mvp: mvp || '',
      notes: notes || '',
      completedAt: new Date()
    };

    await match.save();

    // Update player statistics for all participants
    for (const p of match.participants) {
      if (p.attended) {
        const user = await User.findById(p.user);
        if (user) {
          user.matchesPlayed = (user.matchesPlayed || 0) + 1;
          user.stats = user.stats || { played: 0, won: 0, lost: 0, hosted: 0, mvpCount: 0 };
          user.stats.played = (user.stats.played || 0) + 1;

          if (winner !== 'Draw') {
            if (p.team === winner) {
              user.stats.won = (user.stats.won || 0) + 1;
            } else if (p.team && p.team !== 'Unassigned') {
              user.stats.lost = (user.stats.lost || 0) + 1;
            }
          }

          if (mvp && user.name.toLowerCase() === mvp.trim().toLowerCase()) {
            user.stats.mvpCount = (user.stats.mvpCount || 0) + 1;
          }

          await user.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Match completed and player statistics updated.',
      match: match.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
