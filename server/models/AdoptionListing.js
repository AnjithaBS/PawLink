import mongoose from 'mongoose';

const AdoptionListingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    required: [true, 'Animal image is required']
  },
  animalType: {
    type: String,
    required: [true, 'Animal type is required (e.g. Dog, Cat)'],
    trim: true
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required']
  },
  vaccinationStatus: {
    type: String,
    required: [true, 'Vaccination status is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  contactDetails: {
    type: String,
    required: [true, 'Contact details are required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Available', 'Adopted'],
    default: 'Available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AdoptionListing', AdoptionListingSchema);
