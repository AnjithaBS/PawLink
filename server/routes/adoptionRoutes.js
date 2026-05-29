import express from 'express';
import { createListing, getListings, toggleStatus, deleteListing } from '../controllers/adoptionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createListing);
router.get('/', protect, getListings);
router.put('/:id/status', protect, toggleStatus);
router.delete('/:id', protect, deleteListing);

export default router;
