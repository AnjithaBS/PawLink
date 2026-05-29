import ForumThread from '../models/ForumThread.js';

// @desc    Create forum thread
// @route   POST /api/forum
// @access  Private
export const createThread = async (req, res) => {
  const { title, content, category } = req.body;

  try {
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, message: 'Title, content, and category are required' });
    }

    const thread = await ForumThread.create({
      author: req.user.id,
      title,
      content,
      category
    });

    const populatedThread = await ForumThread.findById(thread._id).populate('author', 'name role');

    res.status(201).json({ success: true, message: 'Thread created successfully!', thread: populatedThread });
  } catch (error) {
    console.error('Create Thread Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating discussion thread' });
  }
};

// @desc    Get forum threads (with search & category filtering)
// @route   GET /api/forum
// @access  Private
export const getThreads = async (req, res) => {
  const { category, search, sortBy } = req.query;

  try {
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { content: { $regex: new RegExp(search, 'i') } }
      ];
    }

    let threads = await ForumThread.find(query)
      .populate('author', 'name role')
      .populate('replies.author', 'name role')
      .sort({ createdAt: -1 });

    // Handle popularity sorting in JS if requested
    if (sortBy === 'popular') {
      threads = threads.sort((a, b) => (b.likes.length + b.replies.length) - (a.likes.length + a.replies.length));
    }

    res.json({ success: true, count: threads.length, threads });
  } catch (error) {
    console.error('Get Threads Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving discussion threads' });
  }
};

// @desc    Like / unlike forum thread
// @route   PUT /api/forum/:id/like
// @access  Private
export const likeThread = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const alreadyLiked = thread.likes.includes(req.user.id);

    if (alreadyLiked) {
      thread.likes = thread.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      thread.likes.push(req.user.id);
    }

    await thread.save();

    res.json({ success: true, likes: thread.likes });
  } catch (error) {
    console.error('Like Thread Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error toggling like on thread' });
  }
};

// @desc    Add reply to thread
// @route   POST /api/forum/:id/reply
// @access  Private
export const createReply = async (req, res) => {
  const { content } = req.body;

  try {
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const thread = await ForumThread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    thread.replies.push({
      author: req.user.id,
      content
    });

    await thread.save();

    const updatedThread = await ForumThread.findById(thread._id)
      .populate('replies.author', 'name role');

    res.json({ success: true, replies: updatedThread.replies });
  } catch (error) {
    console.error('Create Reply Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error posting reply' });
  }
};

// @desc    Like / unlike a reply
// @route   PUT /api/forum/:id/reply/:replyId/like
// @access  Private
export const likeReply = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const reply = thread.replies.id(req.params.replyId);

    if (!reply) {
      return res.status(404).json({ success: false, message: 'Reply not found' });
    }

    const alreadyLiked = reply.likes.includes(req.user.id);

    if (alreadyLiked) {
      reply.likes = reply.likes.filter((id) => id.toString() !== req.user.id);
    } else {
      reply.likes.push(req.user.id);
    }

    await thread.save();

    res.json({ success: true, likes: reply.likes });
  } catch (error) {
    console.error('Like Reply Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error toggling like on reply' });
  }
};

// @desc    Delete thread
// @route   DELETE /api/forum/:id
// @access  Private
export const deleteThread = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Authorization
    if (thread.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this thread' });
    }

    await ForumThread.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Thread deleted successfully!' });
  } catch (error) {
    console.error('Delete Thread Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting thread' });
  }
};
