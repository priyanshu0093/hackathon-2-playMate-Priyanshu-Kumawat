import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.put('/read-all', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, dismissNotification);

export default router;

