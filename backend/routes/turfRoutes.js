import express from 'express';
import {
  getTurfs,
  getTurfById,
  getTurfAvailability,
  createTurf,
  updateTurf,
  getMyVenues,
  blockSlot,
  unblockSlot,
  getOwnerStats
} from '../controllers/turfController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTurfs);
router.get('/owner/my-venues', authenticate, requireRole(['turf_owner']), getMyVenues);
router.get('/owner/stats', authenticate, requireRole(['turf_owner']), getOwnerStats);
router.get('/:id', getTurfById);
router.get('/:id/availability', getTurfAvailability);

// Turf Owner venue management
router.post('/', authenticate, requireRole(['turf_owner']), createTurf);
router.put('/:id', authenticate, requireRole(['turf_owner']), updateTurf);
router.post('/:id/block-slot', authenticate, requireRole(['turf_owner']), blockSlot);
router.post('/:id/unblock-slot', authenticate, requireRole(['turf_owner']), unblockSlot);

export default router;
