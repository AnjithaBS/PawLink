import express from 'express';
import { getAllReports, updateReportStatus, getAdminStats, getUsersAndPets } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/reports', protect, adminOnly, getAllReports);
router.put('/reports/:id/status', protect, adminOnly, updateReportStatus);
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/users', protect, adminOnly, getUsersAndPets);

export default router;
