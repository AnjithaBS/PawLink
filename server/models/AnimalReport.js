import mongoose from 'mongoose';

const AnimalReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  animalType: {
    type: String,
    required: [true, 'Animal type is required (e.g., Dog, Cat, Wild Animal)'],
    trim: true
  },
  issueType: {
    type: String,
    required: true,
    enum: [
      'Injured',
      'Rescue Request',
      'Dead/Decomposed',
      'Treatment Required',
      'Wild Animal Sighting'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the issue'],
    trim: true
  },
  photo: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    address: {
      type: String,
      default: ''
    }
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  contactDetails: {
    type: String,
    required: [true, 'Contact details are required']
  },
  assignedAuthority: {
    type: String,
    default: 'Unassigned'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AnimalReport', AnimalReportSchema);
