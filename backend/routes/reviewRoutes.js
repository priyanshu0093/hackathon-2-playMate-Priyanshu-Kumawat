import express from 'express';
import {
  createReview,
  getTurfReviews,
  getPlayerReviews
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, createReview);
router.get('/turf/:turfId', getTurfReviews);
router.get('/player/:playerId', getPlayerReviews);

export default router;

