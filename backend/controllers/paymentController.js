import crypto from 'crypto';
import prisma from '../config/prisma.js';

/**
 * GET /api/payments/match/:matchId
 * Get cost split summary and per-player payment status for a match
 */
export const getMatchSplit = async (req, res, next) => {
  try {
    const match = await prisma.match.findUnique({
      where: { id: req.params.matchId }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const participants = Array.isArray(match.participants) ? match.participants : [];
    const totalCost = match.estimatedCost || 0;
    const participantCount = participants.length || 1;
    const perPlayerShare = participantCount > 0 ? Math.ceil(totalCost / participantCount) : 0;

    const breakdown = participants.map((p) => ({
      userId: p.user ? String(p.user) : '',
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
      matchId: match.id,
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

    const match = await prisma.match.findUnique({
      where: { id: matchId }
    });
    if (!match) {
      return res.status(404).json({ success: false, error: 'Match not found.' });
    }

    const isHost = match.hostId === req.user.id;
    const isSelf = req.user.id === playerId;

    if (!isHost && !isSelf) {
      return res.status(403).json({ success: false, error: 'Unauthorized to update payment status.' });
    }

    const participants = Array.isArray(match.participants) ? [...match.participants] : [];
    const participant = participants.find((p) => p.user === playerId || String(p.user) === String(playerId));
    if (!participant) {
      return res.status(404).json({ success: false, error: 'Player not in match roster.' });
    }

    participant.paymentStatus = status || 'Paid';
    if (paymentMode) {
      participant.paymentId = `PAY_${paymentMode.toUpperCase()}_${Date.now()}`;
    }

    await prisma.match.update({
      where: { id: matchId },
      data: { participants }
    });

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

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: 'Paid',
          razorpayPaymentId: razorpay_payment_id,
          paymentMethod: 'online'
        }
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
