import HealthSchedule from '../models/HealthSchedule.js';

// @desc    Create pet health reminder schedule
// @route   POST /api/scheduler
// @access  Private
export const createReminder = async (req, res) => {
  const { petName, type, title, dueDate, notes, vetName } = req.body;

  try {
    if (!petName || !type || !title || !dueDate) {
      return res.status(400).json({ success: false, message: 'Pet name, reminder type, title, and due date are required' });
    }

    const reminder = await HealthSchedule.create({
      owner: req.user.id,
      petName,
      type,
      title,
      dueDate: new Date(dueDate),
      notes: notes || '',
      vetName: vetName || '',
      reminderStatus: 'Pending'
    });

    res.status(201).json({ success: true, message: 'Reminder scheduled successfully!', reminder });
  } catch (error) {
    console.error('Create Reminder Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error scheduling reminder' });
  }
};

// @desc    Get user's scheduled reminders
// @route   GET /api/scheduler
// @access  Private
export const getReminders = async (req, res) => {
  try {
    const reminders = await HealthSchedule.find({ owner: req.user.id }).sort({ dueDate: 1 });

    // Proactively mark overdue reminders
    const now = new Date();
    let updated = false;

    for (let r of reminders) {
      if (r.reminderStatus === 'Pending' && new Date(r.dueDate) < now) {
        r.reminderStatus = 'Overdue';
        await r.save();
        updated = true;
      }
    }

    // Re-fetch if updates happened
    const finalReminders = updated 
      ? await HealthSchedule.find({ owner: req.user.id }).sort({ dueDate: 1 })
      : reminders;

    res.json({ success: true, count: finalReminders.length, reminders: finalReminders });
  } catch (error) {
    console.error('Get Reminders Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving reminders' });
  }
};

// @desc    Update reminder status / details
// @route   PUT /api/scheduler/:id
// @access  Private
export const updateReminder = async (req, res) => {
  const { reminderStatus, petName, type, title, dueDate, notes, vetName } = req.body;

  try {
    const reminder = await HealthSchedule.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this reminder' });
    }

    reminder.reminderStatus = reminderStatus || reminder.reminderStatus;
    reminder.petName = petName || reminder.petName;
    reminder.type = type || reminder.type;
    reminder.title = title || reminder.title;
    reminder.dueDate = dueDate ? new Date(dueDate) : reminder.dueDate;
    reminder.notes = notes !== undefined ? notes : reminder.notes;
    reminder.vetName = vetName !== undefined ? vetName : reminder.vetName;

    await reminder.save();

    res.json({ success: true, message: 'Reminder updated successfully!', reminder });
  } catch (error) {
    console.error('Update Reminder Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating reminder' });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/scheduler/:id
// @access  Private
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await HealthSchedule.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check ownership
    if (reminder.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this reminder' });
    }

    await HealthSchedule.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Reminder deleted successfully!' });
  } catch (error) {
    console.error('Delete Reminder Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting reminder' });
  }
};
