import mongoose from 'mongoose';
import { INTERVIEW_STATUS, OPPORTUNITY_TYPES } from '../config/constants.js';

const interviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  opportunityType: {
    type: String,
    enum: Object.values(OPPORTUNITY_TYPES),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(INTERVIEW_STATUS),
    default: INTERVIEW_STATUS.WAITING
  },
  queuePosition: {
    type: Number,
    required: true
  },
  priority: {
    type: Number,
    required: true
  },
  scheduledTime: {
    type: Date
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  duration: {
    type: Number // in minutes
  },
  notes: {
    type: String,
    trim: true
  },
  isRescheduled: {
    type: Boolean,
    default: false
  },
  rescheduledReason: {
    type: String,
    trim: true
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ company: 1, status: 1, queuePosition: 1 });
interviewSchema.index({ student: 1, status: 1 });
interviewSchema.index({ room: 1, status: 1 });

export default mongoose.model('Interview', interviewSchema);