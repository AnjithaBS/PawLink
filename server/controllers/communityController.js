import CommunityPost from '../models/CommunityPost.js';
import fs from 'fs';
import path from 'path';

// @desc    Create a community post
// @route   POST /api/community
// @access  Private
export const createPost = async (req, res) => {
  const { caption, postType } = req.body;
  let image = '';

  if (req.file) {
    image = `/uploads/${req.file.filename}`;
  }

  try {
    if (!caption) {
      return res.status(400).json({ success: false, message: 'Caption is required' });
    }

    const post = await CommunityPost.create({
      author: req.user.id,
      image,
      caption,
      postType: postType || 'general'
    });

    const populatedPost = await CommunityPost.findById(post._id).populate('author', 'name role');

    res.status(201).json({ success: true, message: 'Post shared to community feed!', post: populatedPost });
  } catch (error) {
    console.error('Create Community Post Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating post' });
  }
};

// @desc    Get all community posts
// @route   GET /api/community
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('author', 'name role')
      .populate('comments.user', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    console.error('Get Community Posts Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving feed' });
  }
};

// @desc    Like / unlike a post
// @route   PUT /api/community/:id/like
// @access  Private
export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const alreadyLiked = post.likes.includes(req.user.id);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();

    res.json({ success: true, likes: post.likes });
  } catch (error) {
    console.error('Like Post Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating like' });
  }
};

// @desc    Comment on a post
// @route   POST /api/community/:id/comment
// @access  Private
export const commentPost = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      text
    });

    await post.save();

    const updatedPost = await CommunityPost.findById(post._id)
      .populate('comments.user', 'name role');

    res.json({ success: true, comments: updatedPost.comments });
  } catch (error) {
    console.error('Comment Post Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error posting comment' });
  }
};

// @desc    Delete a post
// @route   DELETE /api/community/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Authorization check
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    // Delete associated image file
    if (post.image && post.image.startsWith('/uploads/')) {
      const imagePath = path.join('.', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Post deleted successfully!' });
  } catch (error) {
    console.error('Delete Post Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting post' });
  }
};
