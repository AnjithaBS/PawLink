import express from 'express';
import { createReport, getReports, toggleStatus, deleteReport } from '../controllers/lostFoundController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createReport);
router.get('/', protect, getReports);
router.put('/:id/status', protect, toggleStatus);
router.delete('/:id', protect, deleteReport);

export default router;
