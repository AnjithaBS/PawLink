import mongoose from 'mongoose';

const LostFoundPetSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Lost', 'Found'],
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  breed: {
    type: String,
    required: [true, 'Breed/Type is required'],
    trim: true
  },
  color: {
    type: String,
    required: [true, 'Color/Markings description is required'],
    trim: true
  },
  lastSeenLocation: {
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
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  contactDetails: {
    type: String,
    required: [true, 'Contact details are required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Missing', 'Found'],
    default: 'Missing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('LostFoundPet', LostFoundPetSchema);
