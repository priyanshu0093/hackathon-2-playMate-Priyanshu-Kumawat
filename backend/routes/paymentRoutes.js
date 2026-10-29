import express from 'express';
import {
  getMatchSplit,
  updatePlayerPaymentStatus,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/match/:matchId', authenticate, getMatchSplit);
router.put('/match/:matchId/player/:playerId', authenticate, updatePlayerPaymentStatus);
router.post('/create-order', authenticate, createRazorpayOrder);
router.post('/verify', authenticate, verifyRazorpayPayment);

export default router;

