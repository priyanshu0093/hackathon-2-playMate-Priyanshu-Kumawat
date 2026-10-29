import prisma from '../config/prisma.js';
import { formatMatch } from '../utils/formatters.js';

/**
 * GET /api/matches
 * Search and filter matches
 */
export const getMatches = async (req, res, next) => {
  try {
    const { sport, city, date, skillLevel, maxPrice, spotsAvailable, q } = req.query;

    const where = {
      status: { not: 'Cancelled' }
    };

    if (city && city !== 'all') {
      where.city = { equals: city.trim(), mode: 'insensitive' };
    }

    if (date) {
      where.date = date;
    }

    if (skillLevel && skillLevel !== 'All Levels') {
      where.skillLevel = { in: [skillLevel, 'All Levels'] };
    }

    if (maxPrice) {
      where.feePerPlayer = { lte: Number(maxPrice) };
    }

    if (spotsAvailable === 'true') {
      where.status = 'Open';
    }

    let matches = await prisma.match.findMany({
      where,
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });

    if (sport && sport !== 'all') {
      const sportLower = sport.trim().toLowerCase();
      matches = matches.filter((m) => m.sport && m.sport.toLowerCase() === sportLower);
    }

    if (q) {
      const qLower = q.trim().toLowerCase();
      matches = matches.filter((m) => {
        const titleMatch = m.title && m.title.toLowerCase().includes(qLower);
        const locMatch = m.location && m.location.toLowerCase().includes(qLower);
        const venueMatch = m.venue && m.venue.toLowerCase().includes(qLower);
        const descMatch = m.description && m.description.toLowerCase().includes(qLower);
        return titleMatch || locMatch || venueMatch || descMatch;
      });
    }

    res.json(matches.map(formatMatch));
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const formatted = formatMatch(match);
    const joinRequests = Array.isArray(match.joinRequests) ? match.joinRequests : [];

    // Attach requests if user is the host
    if (req.user && match.hostId === req.user.id) {
      formatted.joinRequests = joinRequests;
    } else if (req.user) {
      // Show only current user's request status
      formatted.myRequest = joinRequests.find(
        (r) => r.user === req.user.id || String(r.user) === String(req.user.id)
      );
    }

    res.json(formatted);
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

    const hostUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const capacity = Number(maxPlayers) || 10;
    const estCost = Number(estimatedCost) || 0;
    const perPlayerFee = Number(feePerPlayer) || (estCost > 0 ? Math.ceil(estCost / capacity) : 0);

    const initialParticipants = [
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
    ];

    const match = await prisma.match.create({
      data: {
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
        hostId: req.user.id,
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
        rules: Array.isArray(rules) && rules.length ? rules : [],
        participants: initialParticipants
      }
    });

    // Auto-create initial welcoming chat message
    await prisma.chatMessage.create({
      data: {
        matchId: match.id,
        senderId: req.user.id,
        senderName: match.hostName,
        senderAvatar: match.hostAvatar,
        text: `Match created! Welcome to ${match.title}. Discuss details, bibs, and coordination here.`
      }
    });

    // Increment host statistics
    if (hostUser) {
      const stats = (hostUser.stats && typeof hostUser.stats === 'object')
        ? { ...hostUser.stats }
        : { played: 0, won: 0, lost: 0, hosted: 0, mvpCount: 0 };
      stats.hosted = (stats.hosted || 0) + 1;

      await prisma.user.update({
        where: { id: hostUser.id },
        data: { stats }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Match created successfully.',
      match: formatMatch(match)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can modify this match.' });
    }

    const updatable = [
      'title', 'description', 'date', 'time', 'duration', 'location',
      'venue', 'skillLevel', 'maxPlayers', 'visibility', 'rules', 'feePerPlayer'
    ];

    const data = {};
    for (const field of updatable) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data
    });

    res.json({
      success: true,
      message: 'Match updated successfully.',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can cancel this match.' });
    }

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: { status: 'Cancelled' }
    });

    // Notify all participants
    const participants = Array.isArray(match.participants) ? match.participants : [];
    for (const p of participants) {
      if (p.user && p.user !== req.user.id) {
        await prisma.notification.create({
          data: {
            recipientId: p.user,
            senderId: req.user.id,
            senderName: match.hostName,
            type: 'booking_cancelled',
            title: 'Match Cancelled',
            message: `The match "${match.title}" has been cancelled by the host.`,
            actionLink: '/player/matches'
          }
        });
      }
    }

    res.json({
      success: true,
      message: 'Match cancelled and participants notified.',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.status === 'Cancelled' || match.status === 'Completed') {
      return res.status(400).json({ success: false, error: `Cannot join a ${match.status.toLowerCase()} match.` });
    }

    const userId = req.user.id;
    const participants = Array.isArray(match.participants) ? [...match.participants] : [];
    const joinRequests = Array.isArray(match.joinRequests) ? [...match.joinRequests] : [];

    // Check duplicate participation
    const alreadyJoined = participants.some((p) => p.user === userId || String(p.user) === String(userId));
    if (alreadyJoined) {
      return res.status(400).json({ success: false, error: 'You are already in this match roster.' });
    }

    // Check capacity
    if (participants.length >= match.maxPlayers) {
      return res.status(400).json({
        success: false,
        error: 'This match is full. You can join the waitlist instead.',
        isFull: true
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // If match requires host approval
    if (match.requiresApproval) {
      const alreadyRequested = joinRequests.some(
        (r) => (r.user === userId || String(r.user) === String(userId)) && r.status === 'pending'
      );
      if (alreadyRequested) {
        return res.status(400).json({ success: false, error: 'Join request already submitted.' });
      }

      joinRequests.push({
        user: userId,
        name: user.name,
        avatar: user.avatar,
        message: req.body.message || '',
        status: 'pending'
      });

      const updated = await prisma.match.update({
        where: { id: req.params.id },
        data: { joinRequests }
      });

      // Notify host
      await prisma.notification.create({
        data: {
          recipientId: match.hostId,
          senderId: userId,
          senderName: user.name,
          type: 'join_request',
          title: 'New Join Request',
          message: `${user.name} requested to join "${match.title}".`,
          actionLink: `/player/matches/${match.id}`
        }
      });

      return res.json({
        success: true,
        pendingApproval: true,
        message: 'Join request submitted for host approval.',
        match: formatMatch(updated)
      });
    }

    // Direct join
    participants.push({
      user: userId,
      name: user.name,
      avatar: user.avatar,
      role: user.playingRole || 'Player',
      skillLevel: user.skillLevel || 'Intermediate',
      team: 'Unassigned',
      attended: true,
      paymentStatus: 'Pending'
    });

    const newStatus = participants.length >= match.maxPlayers ? 'Full' : 'Open';

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        participants,
        status: newStatus
      }
    });

    // Notify host
    if (match.hostId !== userId) {
      await prisma.notification.create({
        data: {
          recipientId: match.hostId,
          senderId: userId,
          senderName: user.name,
          type: 'join_request',
          title: 'New Player Joined!',
          message: `${user.name} joined "${match.title}".`,
          actionLink: `/player/matches/${match.id}`
        }
      });
    }

    res.json({
      success: true,
      message: 'Joined match successfully!',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const userId = req.user.id;

    if (match.hostId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Host cannot leave the match. You can cancel the match if needed.'
      });
    }

    const participants = Array.isArray(match.participants) ? [...match.participants] : [];
    const waitlist = Array.isArray(match.waitlist) ? [...match.waitlist] : [];

    const participantIdx = participants.findIndex(
      (p) => p.user === userId || String(p.user) === String(userId)
    );
    if (participantIdx === -1) {
      return res.status(400).json({ success: false, error: 'You are not in this match.' });
    }

    participants.splice(participantIdx, 1);

    // Substitute promotion
    let promotedPlayer = null;
    if (waitlist.length > 0) {
      const nextInLine = waitlist.shift();
      const nextUser = await prisma.user.findUnique({
        where: { id: nextInLine.user }
      });

      if (nextUser) {
        participants.push({
          user: nextUser.id,
          name: nextUser.name,
          avatar: nextUser.avatar,
          role: nextUser.playingRole || 'Player',
          skillLevel: nextUser.skillLevel || 'Intermediate',
          team: 'Unassigned',
          attended: true,
          paymentStatus: 'Pending'
        });

        promotedPlayer = nextUser;

        await prisma.notification.create({
          data: {
            recipientId: nextUser.id,
            type: 'request_approved',
            title: 'Promoted from Waitlist! 🏆',
            message: `A spot opened up! You are now in the active lineup for "${match.title}".`,
            actionLink: `/player/matches/${match.id}`
          }
        });
      }
    }

    const newStatus = participants.length < match.maxPlayers ? 'Open' : 'Full';

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        participants,
        waitlist,
        status: newStatus
      }
    });

    res.json({
      success: true,
      message: promotedPlayer
        ? `Left match. Promoted waitlisted substitute ${promotedPlayer.name}.`
        : 'Left match successfully.',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const userId = req.user.id;
    const participants = Array.isArray(match.participants) ? match.participants : [];
    const waitlist = Array.isArray(match.waitlist) ? [...match.waitlist] : [];

    if (participants.some((p) => p.user === userId || String(p.user) === String(userId))) {
      return res.status(400).json({ success: false, error: 'You are already in the match roster.' });
    }

    if (waitlist.some((w) => w.user === userId || String(w.user) === String(userId))) {
      return res.status(400).json({ success: false, error: 'You are already on the waitlist.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    waitlist.push({
      user: userId,
      name: user.name,
      avatar: user.avatar
    });

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: { waitlist }
    });

    res.json({
      success: true,
      message: 'Added to waitlist. You will be automatically enrolled if a player leaves.',
      waitlistPosition: waitlist.length,
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can approve requests.' });
    }

    const { userId } = req.params;
    const joinRequests = Array.isArray(match.joinRequests) ? [...match.joinRequests] : [];
    const participants = Array.isArray(match.participants) ? [...match.participants] : [];

    const reqIndex = joinRequests.findIndex(
      (r) => (r.user === userId || String(r.user) === String(userId)) && r.status === 'pending'
    );

    if (reqIndex === -1) {
      return res.status(404).json({ success: false, error: 'Pending join request not found.' });
    }

    if (participants.length >= match.maxPlayers) {
      return res.status(400).json({ success: false, error: 'Cannot approve: match is already at full capacity.' });
    }

    const approvedUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    joinRequests[reqIndex].status = 'approved';
    participants.push({
      user: approvedUser.id,
      name: approvedUser.name,
      avatar: approvedUser.avatar,
      role: approvedUser.playingRole || 'Player',
      skillLevel: approvedUser.skillLevel || 'Intermediate',
      team: 'Unassigned',
      attended: true,
      paymentStatus: 'Pending'
    });

    const newStatus = participants.length >= match.maxPlayers ? 'Full' : match.status;

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        joinRequests,
        participants,
        status: newStatus
      }
    });

    // Notify approved player
    await prisma.notification.create({
      data: {
        recipientId: approvedUser.id,
        senderId: req.user.id,
        senderName: match.hostName,
        type: 'request_approved',
        title: 'Join Request Approved! ⚽',
        message: `Your request to join "${match.title}" was approved by the host.`,
        actionLink: `/player/matches/${match.id}`
      }
    });

    res.json({
      success: true,
      message: `${approvedUser.name} added to match roster.`,
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can reject requests.' });
    }

    const { userId } = req.params;
    const joinRequests = Array.isArray(match.joinRequests) ? [...match.joinRequests] : [];

    const reqIndex = joinRequests.findIndex(
      (r) => (r.user === userId || String(r.user) === String(userId)) && r.status === 'pending'
    );

    if (reqIndex === -1) {
      return res.status(404).json({ success: false, error: 'Pending join request not found.' });
    }

    joinRequests[reqIndex].status = 'rejected';

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: { joinRequests }
    });

    // Notify rejected player
    await prisma.notification.create({
      data: {
        recipientId: userId,
        senderId: req.user.id,
        senderName: match.hostName,
        type: 'request_rejected',
        title: 'Join Request Declined',
        message: `Your request to join "${match.title}" was declined by the host.`,
        actionLink: '/player/matches'
      }
    });

    res.json({
      success: true,
      message: 'Join request declined.',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can invite players.' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Target player ID is required.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Player not found.' });
    }

    const participants = Array.isArray(match.participants) ? match.participants : [];
    if (participants.some((p) => p.user === userId || String(p.user) === String(userId))) {
      return res.status(400).json({ success: false, error: 'Player is already in this match.' });
    }

    const invitedPlayers = Array.isArray(match.invitedPlayers) ? [...match.invitedPlayers] : [];
    if (!invitedPlayers.some((i) => i.user === userId || String(i.user) === String(userId))) {
      invitedPlayers.push({ user: userId });
      await prisma.match.update({
        where: { id: req.params.id },
        data: { invitedPlayers }
      });
    }

    await prisma.notification.create({
      data: {
        recipientId: userId,
        senderId: req.user.id,
        senderName: match.hostName,
        type: 'match_invite',
        title: `Match Invite from ${match.hostName}`,
        message: `You were invited to join "${match.title}" on ${match.date} at ${match.time}.`,
        actionLink: `/player/matches/${match.id}`
      }
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can balance teams.' });
    }

    const participants = Array.isArray(match.participants) ? [...match.participants] : [];
    if (participants.length < 2) {
      return res.status(400).json({ success: false, error: 'Need at least 2 players to form teams.' });
    }

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

    const teams = {
      teamA: { name: 'Team Blue', score: 0, players: teamA },
      teamB: { name: 'Team Orange', score: 0, players: teamB }
    };

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        participants,
        teams
      }
    });

    res.json({
      success: true,
      message: 'Teams balanced deterministically based on player skill levels.',
      match: formatMatch(updated)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the match host can mark attendance.' });
    }

    const { attendance } = req.body;
    let participants = Array.isArray(match.participants) ? [...match.participants] : [];

    if (Array.isArray(attendance)) {
      for (const item of attendance) {
        const participant = participants.find((p) => p.user === item.userId || String(p.user) === String(item.userId));
        if (participant) {
          participant.attended = !!item.attended;
        }
      }

      const updated = await prisma.match.update({
        where: { id: req.params.id },
        data: { participants }
      });

      return res.json({
        success: true,
        message: 'Attendance records updated.',
        match: formatMatch(updated)
      });
    }

    res.json({
      success: true,
      message: 'Attendance records unchanged.',
      match: formatMatch(match)
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
    const match = await prisma.match.findUnique({
      where: { id: req.params.id }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    if (match.hostId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the host can record match results.' });
    }

    const { teamAScore, teamBScore, mvp, notes } = req.body;

    const aScore = Number(teamAScore) || 0;
    const bScore = Number(teamBScore) || 0;
    let winner = 'Draw';
    if (aScore > bScore) winner = 'Team A';
    else if (bScore > aScore) winner = 'Team B';

    const result = {
      winner,
      teamAScore: aScore,
      teamBScore: bScore,
      mvp: mvp || '',
      notes: notes || '',
      completedAt: new Date().toISOString()
    };

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data: {
        status: 'Completed',
        result
      }
    });

    // Update player statistics for all participants
    const participants = Array.isArray(match.participants) ? match.participants : [];
    for (const p of participants) {
      if (p.attended && p.user) {
        const user = await prisma.user.findUnique({
          where: { id: p.user }
        });
        if (user) {
          const stats = (user.stats && typeof user.stats === 'object')
            ? { ...user.stats }
            : { played: 0, won: 0, lost: 0, hosted: 0, mvpCount: 0 };

          stats.played = (stats.played || 0) + 1;

          if (winner !== 'Draw') {
            if (p.team === winner) {
              stats.won = (stats.won || 0) + 1;
            } else if (p.team && p.team !== 'Unassigned') {
              stats.lost = (stats.lost || 0) + 1;
            }
          }

          if (mvp && user.name.toLowerCase() === mvp.trim().toLowerCase()) {
            stats.mvpCount = (stats.mvpCount || 0) + 1;
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              matchesPlayed: (user.matchesPlayed || 0) + 1,
              stats
            }
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Match completed and player statistics updated.',
      match: formatMatch(updated)
    });
  } catch (error) {
    next(error);
  }
};
