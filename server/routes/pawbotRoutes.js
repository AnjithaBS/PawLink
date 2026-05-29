import express from 'express';
import { handlePawbotChat, getPawbotHistory, clearPawbotHistory } from '../chatbot/pawbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, handlePawbotChat);
router.get('/history', protect, getPawbotHistory);
router.delete('/history', protect, clearPawbotHistory);

export default router;
