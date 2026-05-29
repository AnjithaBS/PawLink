import mongoose from 'mongoose';

const ReplySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Reply content cannot be empty'],
    trim: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ForumThreadSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Thread title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Thread content is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Health', 'Training', 'Rescue', 'Adoption', 'Pet Care'],
    required: [true, 'Category is required']
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  replies: [ReplySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ForumThread', ForumThreadSchema);
