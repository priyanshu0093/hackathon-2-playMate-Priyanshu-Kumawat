import express from 'express';
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  cancelMatch,
  joinMatch,
  leaveMatch,
  joinWaitlist,
  approveJoinRequest,
  rejectJoinRequest,
  invitePlayer,
  balanceTeams,
  updateAttendance,
  completeMatch
} from '../controllers/matchController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMatches);
router.get('/:id', optionalAuthenticate, getMatchById);
router.post('/', authenticate, createMatch);
router.put('/:id', authenticate, updateMatch);
router.delete('/:id', authenticate, cancelMatch);

// Participation actions
router.post('/:id/join', authenticate, joinMatch);
router.post('/:id/leave', authenticate, leaveMatch);
router.post('/:id/waitlist', authenticate, joinWaitlist);

// Host request management
router.post('/:id/requests/:userId/approve', authenticate, approveJoinRequest);
router.post('/:id/requests/:userId/reject', authenticate, rejectJoinRequest);
router.post('/:id/invite', authenticate, invitePlayer);

// Team balancing, attendance, and results
router.post('/:id/teams/balance', authenticate, balanceTeams);
router.put('/:id/attendance', authenticate, updateAttendance);
router.post('/:id/complete', authenticate, completeMatch);

export default router;
