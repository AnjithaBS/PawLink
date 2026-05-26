import express from 'express';
import { createReport, getMyReports, getReportById } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('photo'), createReport);
router.get('/my', protect, getMyReports);
router.get('/:id', protect, getReportById);

export default router;
