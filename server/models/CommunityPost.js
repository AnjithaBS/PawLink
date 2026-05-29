import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CommunityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    required: [true, 'Caption is required'],
    trim: true
  },
  postType: {
    type: String,
    enum: ['general', 'rescue_story', 'care_tip', 'experience'],
    default: 'general'
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CommunityPost', CommunityPostSchema);
