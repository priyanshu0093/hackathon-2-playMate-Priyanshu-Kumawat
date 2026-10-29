import Review from '../models/Review.js';
import TurfProfile from '../models/TurfProfile.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Match from '../models/Match.js';

/**
 * POST /api/reviews
 * Submit review for a Turf venue or fellow Player
 */
export const createReview = async (req, res, next) => {
  try {
    const { type, turfId, targetUserId, matchId, bookingId, rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5.' });
    }

    const reviewer = await User.findById(req.user.id);

    if (type === 'turf') {
      if (!turfId) {
        return res.status(400).json({ success: false, error: 'Turf venue ID is required.' });
      }

      // Check duplicate review
      const existing = await Review.findOne({
        reviewer: req.user.id,
        turf: turfId,
        ...(bookingId ? { booking: bookingId } : {})
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'You have already submitted a review for this venue reservation.'
        });
      }

      const review = await Review.create({
        type: 'turf',
        turf: turfId,
        reviewer: req.user.id,
        reviewerName: reviewer ? reviewer.name : req.user.name,
        reviewerAvatar: reviewer ? reviewer.avatar : '',
        booking: bookingId || null,
        rating: ratingNum,
        comment: (comment || '').trim()
      });

      // Recalculate average rating for Turf
      const allTurfReviews = await Review.find({ turf: turfId });
      const avgRating =
        allTurfReviews.reduce((acc, curr) => acc + curr.rating, 0) / allTurfReviews.length;

      await TurfProfile.findByIdAndUpdate(turfId, {
        rating: Number(avgRating.toFixed(1)),
        reviewsCount: allTurfReviews.length
      });

      return res.status(201).json({
        success: true,
        message: 'Venue review submitted successfully!',
        review: review.toJSON()
      });
    } else if (type === 'player') {
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: 'Target player ID is required.' });
      }

      if (targetUserId === req.user.id) {
        return res.status(400).json({ success: false, error: 'You cannot rate yourself.' });
      }

      // Check duplicate review
      const existing = await Review.findOne({
        reviewer: req.user.id,
        targetUser: targetUserId,
        ...(matchId ? { match: matchId } : {})
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'You have already rated this player for this match.'
        });
      }

      const review = await Review.create({
        type: 'player',
        targetUser: targetUserId,
        reviewer: req.user.id,
        reviewerName: reviewer ? reviewer.name : req.user.name,
        reviewerAvatar: reviewer ? reviewer.avatar : '',
        match: matchId || null,
        rating: ratingNum,
        comment: (comment || '').trim()
      });

      // Recalculate player rating
      const allPlayerReviews = await Review.find({ targetUser: targetUserId });
      const avgRating =
        allPlayerReviews.reduce((acc, curr) => acc + curr.rating, 0) / allPlayerReviews.length;

      await User.findByIdAndUpdate(targetUserId, {
        rating: Number(avgRating.toFixed(1)),
        ratingsCount: allPlayerReviews.length
      });

      return res.status(201).json({
        success: true,
        message: 'Player rating submitted successfully!',
        review: review.toJSON()
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid review type. Must be "turf" or "player".' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/turf/:turfId
 * Reviews for a specific turf venue
 */
export const getTurfReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ turf: req.params.turfId }).sort({ createdAt: -1 });
    res.json(reviews.map((r) => r.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/player/:playerId
 * Ratings/reviews received by a player
 */
export const getPlayerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetUser: req.params.playerId }).sort({ createdAt: -1 });
    res.json(reviews.map((r) => r.toJSON()));
  } catch (error) {
    next(error);
  }
};

