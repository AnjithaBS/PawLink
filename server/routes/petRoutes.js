import express from 'express';
import { addPet, getPets, updatePet, deletePet } from '../controllers/petController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), addPet);
router.get('/', protect, getPets);
router.put('/:id', protect, upload.single('image'), updatePet);
router.delete('/:id', protect, deletePet);

export default router;
