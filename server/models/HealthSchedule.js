import mongoose from 'mongoose';

const HealthScheduleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petName: {
    type: String,
    required: [true, 'Pet name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Vaccination', 'Medicine', 'Vet Appointment', 'Feeding'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required (e.g. Rabies Vaccine, Deworming)'],
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date and time is required']
  },
  notes: {
    type: String,
    default: ''
  },
  vetName: {
    type: String,
    default: ''
  },
  reminderStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('HealthSchedule', HealthScheduleSchema);
