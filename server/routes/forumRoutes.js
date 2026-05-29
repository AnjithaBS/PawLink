import express from 'express';
import { createThread, getThreads, likeThread, createReply, likeReply, deleteThread } from '../controllers/forumController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createThread);
router.get('/', protect, getThreads);
router.put('/:id/like', protect, likeThread);
router.post('/:id/reply', protect, createReply);
router.put('/:id/reply/:replyId/like', protect, likeReply);
router.delete('/:id', protect, deleteThread);

export default router;
