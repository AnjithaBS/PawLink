import mongoose from 'mongoose';

const AuthoritySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Authority name is required'],
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Municipality',
      'Fire Force',
      'Animal Hospital',
      'Veterinary Hospital',
      'Forest Office'
    ]
  },
  contact: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      default: ''
    }
  }
});

export default mongoose.model('Authority', AuthoritySchema);
