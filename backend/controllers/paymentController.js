import Match from '../models/Match.js';
import Booking from '../models/Booking.js';
import crypto from 'crypto';

/**
 * GET /api/payments/match/:matchId
 * Get cost split summary and per-player payment status for a match
 */
export const getMatchSplit = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const participants = match.participants || [];
    const totalCost = match.estimatedCost || 0;
    const participantCount = participants.length || 1;
    const perPlayerShare = participantCount > 0 ? Math.ceil(totalCost / participantCount) : 0;

    const breakdown = participants.map((p) => ({
      userId: p.user.toString(),
      name: p.name,
      avatar: p.avatar,
      role: p.role,
      share: perPlayerShare,
      status: p.paymentStatus || 'Pending',
      attended: p.attended
    }));

    const paidCount = participants.filter((p) => p.paymentStatus === 'Paid').length;
    const totalCollected = paidCount * perPlayerShare;

    res.json({
      success: true,
      matchId: match._id,
      title: match.title,
      totalCost,
      participantCount,
      perPlayerShare,
      totalCollected,
      remainingAmount: Math.max(0, totalCost - totalCollected),
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/payments/match/:matchId/player/:playerId
 * Host or player updates payment status (Supports manual / demo cash settlement)
 */
export const updatePlayerPaymentStatus = async (req, res, next) => {
  try {
    const { matchId, playerId } = req.params;
    const { status, paymentMode } = req.body;

    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const isHost = match.host.toString() === req.user.id;
    const isSelf = req.user.id === playerId;

    if (!isHost && !isSelf) {
      return res.status(403).json({ success: false, error: 'Unauthorized to update payment status.' });
    }

    const participant = match.participants.find((p) => p.user.toString() === playerId);
    if (!participant) {
      return res.status(404).json({ success: false, error: 'Player not in match roster.' });
    }

    participant.paymentStatus = status || 'Paid';
    if (paymentMode) {
      participant.paymentId = `PAY_${paymentMode.toUpperCase()}_${Date.now()}`;
    }

    await match.save();

    res.json({
      success: true,
      message: `Payment status updated to ${participant.paymentStatus}.`,
      participant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/create-order
 * Razorpay order creation (prepares online gateway if credentials configured)
 */
export const createRazorpayOrder = async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'your_razorpay_key_id') {
    // Return transparent demo payment payload
    return res.json({
      success: true,
      mode: 'demo_simulation',
      note: 'Razorpay keys not configured in environment. Using PlayMate verified demo settlement.',
      order: {
        id: `order_demo_${Date.now()}`,
        amount: Number(amount) * 100,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`
      }
    });
  }

  try {
    // If genuine Razorpay credentials exist
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency,
        receipt: receipt || `rcpt_${Date.now()}`
      })
    });

    const order = await response.json();
    return res.json({
      success: true,
      mode: 'razorpay_live',
      order
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to initiate payment order.' });
  }
};

/**
 * POST /api/payments/verify
 * Razorpay webhook & client signature verification
 */
export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, matchId } = req.body;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret || keySecret === 'your_razorpay_key_secret') {
    // In demo mode
    return res.json({
      success: true,
      mode: 'demo_verified',
      message: 'Demo payment simulated and marked as verified.'
    });
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed.' });
    }

    // Update booking or match payment status
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'Paid',
        paymentId: razorpay_payment_id,
        paymentMode: 'online'
      });
    }

    return res.json({
      success: true,
      mode: 'razorpay_verified',
      message: 'Payment verified and transaction confirmed.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Signature verification error.' });
  }
};

