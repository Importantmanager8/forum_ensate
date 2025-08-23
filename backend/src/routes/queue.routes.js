import express from 'express';
import Queue from '../models/queue.model.js';
import Interview from '../models/interview.model.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { INTERVIEW_STATUS, OPPORTUNITY_TYPES, PRIORITY_LEVELS } from '../config/constants.js';

const router = express.Router();

// Get all queues
router.get('/', authenticate, async (req, res) => {
  try {
    const queues = await Queue.find().populate('company room currentInterview');
    res.json(queues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get queue for a specific company
router.get('/company/:companyId', authenticate, async (req, res) => {
  try {
    const queue = await Queue.findOne({ company: req.params.companyId })
      .populate('company room currentInterview')
      .populate({
        path: 'nextInterviews.interview',
        populate: { path: 'student', select: 'firstName lastName email role' }
      });
    
    if (!queue) {
      return res.status(404).json({ message: 'Queue not found for this company' });
    }
    
    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student's queue positions
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const interviews = await Interview.find({ 
      student: req.params.studentId,
      status: { $in: [INTERVIEW_STATUS.WAITING, INTERVIEW_STATUS.IN_PROGRESS] }
    }).populate('company room');
    
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join queue (FIFO - First In, First Out)
router.post('/join', authenticate, async (req, res) => {
  try {
    const { companyId, opportunityType } = req.body;
    const studentId = req.user._id;

    // Check if student is already in queue for this company
    const existingInterview = await Interview.findOne({
      student: studentId,
      company: companyId,
      status: { $in: [INTERVIEW_STATUS.WAITING, INTERVIEW_STATUS.IN_PROGRESS] }
    });

    if (existingInterview) {
      return res.status(400).json({ message: 'You are already in queue for this company' });
    }

    // Get or create queue for the company
    let queue = await Queue.findOne({ company: companyId });
    if (!queue) {
      return res.status(404).json({ message: 'No queue found for this company' });
    }

    // Get the next position in queue
    const lastInterview = await Interview.findOne({
      company: companyId,
      status: INTERVIEW_STATUS.WAITING
    }).sort({ queuePosition: -1 });

    const nextPosition = lastInterview ? lastInterview.queuePosition + 1 : 1;

    // Calculate priority based on user role and opportunity type
    let priority = PRIORITY_LEVELS.EXTERNAL_STUDENT;
    if (req.user.role === 'committee') {
      priority = PRIORITY_LEVELS.COMMITTEE;
    } else if (req.user.status === 'ensa') {
      priority = PRIORITY_LEVELS.ENSA_STUDENT;
    }

    // Create new interview entry
    const interview = new Interview({
      student: studentId,
      company: companyId,
      room: queue.room,
      opportunityType,
      status: INTERVIEW_STATUS.WAITING,
      queuePosition: nextPosition,
      priority
    });

    await interview.save();

    // Update queue
    queue.nextInterviews.push({
      interview: interview._id,
      estimatedTime: new Date(Date.now() + (queue.averageInterviewDuration * 60000 * queue.nextInterviews.length))
    });
    await queue.save();

    res.status(201).json({
      message: 'Successfully joined queue',
      interview,
      queuePosition: nextPosition
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave queue
router.delete('/leave/:interviewId', authenticate, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to leave this queue' });
    }

    if (interview.status !== INTERVIEW_STATUS.WAITING) {
      return res.status(400).json({ message: 'Cannot leave queue - interview already in progress or completed' });
    }

    // Remove from queue
    await Queue.updateOne(
      { company: interview.company },
      { $pull: { nextInterviews: { interview: interview._id } } }
    );

    // Delete interview
    await Interview.findByIdAndDelete(interview._id);

    res.json({ message: 'Successfully left queue' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get next student in queue (for committee)
router.get('/next/:companyId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'committee') {
      return res.status(403).json({ message: 'Only committee members can access this endpoint' });
    }

    const nextInterview = await Interview.findOne({
      company: req.params.companyId,
      status: INTERVIEW_STATUS.WAITING
    }).sort({ priority: 1, queuePosition: 1 }).populate('student');

    if (!nextInterview) {
      return res.status(404).json({ message: 'No students in queue' });
    }

    res.json(nextInterview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start interview (move from waiting to in_progress)
router.put('/start/:interviewId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'committee') {
      return res.status(403).json({ message: 'Only committee members can start interviews' });
    }

    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = INTERVIEW_STATUS.IN_PROGRESS;
    interview.actualStartTime = new Date();
    await interview.save();

    // Update queue
    await Queue.updateOne(
      { company: interview.company },
      { 
        currentInterview: interview._id,
        $pull: { nextInterviews: { interview: interview._id } }
      }
    );

    res.json({ message: 'Interview started', interview });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Complete interview
router.put('/complete/:interviewId', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'committee') {
      return res.status(403).json({ message: 'Only committee members can complete interviews' });
    }

    const interview = await Interview.findById(req.params.interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = INTERVIEW_STATUS.COMPLETED;
    interview.actualEndTime = new Date();
    interview.duration = Math.round((interview.actualEndTime - interview.actualStartTime) / 60000);
    await interview.save();

    // Update queue
    await Queue.updateOne(
      { company: interview.company },
      { 
        currentInterview: null,
        $inc: { completedInterviews: 1, totalInterviewsToday: 1 }
      }
    );

    res.json({ message: 'Interview completed', interview });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new queue
router.post('/', authenticate, async (req, res) => {
  try {
    const queue = new Queue(req.body);
    await queue.save();
    res.status(201).json(queue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 