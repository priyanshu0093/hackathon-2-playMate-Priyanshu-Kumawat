import express from 'express';
import {
  getMatchChats,
  getMatchMessages,
  postMatchMessage
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getMatchChats);
router.get('/:matchId', authenticate, getMatchMessages);
router.post('/:matchId', authenticate, postMatchMessage);

export default router;

