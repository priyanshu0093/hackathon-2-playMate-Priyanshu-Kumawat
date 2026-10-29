import express from 'express';
import {
  getPlayers,
  getUserById,
  getMyMatches,
  uploadFile
} from '../controllers/userController.js';
import { updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { sanitizeProfileUpdate } from '../validators/authValidators.js';

const router = express.Router();

// Player discovery
router.get('/players', getPlayers);

// My matches (upcoming & completed)
router.get('/me/matches', authenticate, getMyMatches);

// Profile view & update
router.get('/profile', authenticate, (req, res, next) => {
  req.params.id = req.user.id;
  getUserById(req, res, next);
});
router.put('/profile', authenticate, sanitizeProfileUpdate, updateProfile);

// Get specific user public profile
router.get('/:id', getUserById);

// Upload image (avatar / turf photo)
router.post('/upload', authenticate, upload.single('image'), uploadFile);

export default router;

