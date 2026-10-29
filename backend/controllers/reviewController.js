import prisma from '../config/prisma.js';
import { formatReview } from '../utils/formatters.js';

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

    const reviewer = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (type === 'turf') {
      if (!turfId) {
        return res.status(400).json({ success: false, error: 'Turf venue ID is required.' });
      }

      // Check duplicate review
      const existing = await prisma.review.findFirst({
        where: {
          reviewerId: req.user.id,
          turfId,
          ...(bookingId ? { bookingId } : {})
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'You have already submitted a review for this venue reservation.'
        });
      }

      const review = await prisma.review.create({
        data: {
          type: 'turf',
          turfId,
          reviewerId: req.user.id,
          reviewerName: reviewer ? reviewer.name : req.user.name,
          reviewerAvatar: reviewer ? reviewer.avatar : '',
          bookingId: bookingId || null,
          rating: ratingNum,
          review: (comment || '').trim()
        }
      });

      // Recalculate average rating for Turf
      const allTurfReviews = await prisma.review.findMany({
        where: { turfId }
      });
      const avgRating =
        allTurfReviews.reduce((acc, curr) => acc + curr.rating, 0) / allTurfReviews.length;

      await prisma.turfProfile.update({
        where: { id: turfId },
        data: {
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: allTurfReviews.length
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Venue review submitted successfully!',
        review: formatReview(review)
      });
    } else if (type === 'player') {
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: 'Target player ID is required.' });
      }

      if (targetUserId === req.user.id) {
        return res.status(400).json({ success: false, error: 'You cannot rate yourself.' });
      }

      // Check duplicate review
      const existing = await prisma.review.findFirst({
        where: {
          reviewerId: req.user.id,
          targetUserId,
          ...(matchId ? { matchId } : {})
        }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'You have already rated this player for this match.'
        });
      }

      const review = await prisma.review.create({
        data: {
          type: 'player',
          targetUserId,
          reviewerId: req.user.id,
          reviewerName: reviewer ? reviewer.name : req.user.name,
          reviewerAvatar: reviewer ? reviewer.avatar : '',
          matchId: matchId || null,
          rating: ratingNum,
          review: (comment || '').trim()
        }
      });

      // Recalculate player rating
      const allPlayerReviews = await prisma.review.findMany({
        where: { targetUserId }
      });
      const avgRating =
        allPlayerReviews.reduce((acc, curr) => acc + curr.rating, 0) / allPlayerReviews.length;

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          rating: Number(avgRating.toFixed(1)),
          ratingsCount: allPlayerReviews.length
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Player rating submitted successfully!',
        review: formatReview(review)
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
    const reviews = await prisma.review.findMany({
      where: { turfId: req.params.turfId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews.map(formatReview));
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
    const reviews = await prisma.review.findMany({
      where: { targetUserId: req.params.playerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews.map(formatReview));
  } catch (error) {
    next(error);
  }
};
