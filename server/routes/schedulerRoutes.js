import express from 'express';
import { createReminder, getReminders, updateReminder, deleteReminder } from '../controllers/schedulerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReminder);
router.get('/', protect, getReminders);
router.put('/:id', protect, updateReminder);
router.delete('/:id', protect, deleteReminder);

export default router;
