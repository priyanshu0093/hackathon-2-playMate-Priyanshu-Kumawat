import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/', authenticate, createBooking);
router.put('/:id/cancel', authenticate, cancelBooking);
router.put('/:id/reschedule', authenticate, rescheduleBooking);
router.put('/:id/status', authenticate, requireRole(['turf_owner']), updateBookingStatus);

export default router;
