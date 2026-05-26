import Notification from '../models/Notification.js';

// @desc    Get user notifications (and system notifications if admin)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    let query = { user: req.user.id };

    // Admins also fetch notifications where user is null (system/admin alerts)
    if (req.user.role === 'admin') {
      query = {
        $or: [
          { user: req.user.id },
          { user: null }
        ]
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Ensure notification belongs to user (or is system-wide)
    if (notification.user && notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to read this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating notification status' });
  }
};
