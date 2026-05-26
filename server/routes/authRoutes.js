import express from 'express';
import { register, login, getProfile, updatePetPreference } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/update-pet-preference', protect, updatePetPreference);

export default router;
