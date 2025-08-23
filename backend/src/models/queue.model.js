import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  currentInterview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview'
  },
  nextInterviews: [{
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    estimatedTime: {
      type: Date
    }
  }],
  averageInterviewDuration: {
    type: Number,
    default: 20 // minutes
  },
  totalInterviewsToday: {
    type: Number,
    default: 0
  },
  completedInterviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Queue', queueSchema);