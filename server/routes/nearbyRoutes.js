import express from 'express';
import { getNearbyServices } from '../controllers/nearbyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNearbyServices);

export default router;
