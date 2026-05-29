import express from 'express';
import { createPost, getPosts, likePost, commentPost, deletePost } from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), createPost);
router.get('/', protect, getPosts);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);
router.delete('/:id', protect, deletePost);

export default router;
