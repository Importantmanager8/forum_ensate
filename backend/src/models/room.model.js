import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    default: 1
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    unique: true, // This ensures a company can only be assigned to one room
    sparse: true  // Allows multiple rooms with no company assigned
  },
  assignedCommittee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  equipment: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Room', roomSchema, 'rooms');