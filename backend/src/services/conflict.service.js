import Interview from '../models/interview.model.js';
import { INTERVIEW_STATUS } from '../config/constants.js';

export const detectTimeConflicts = async (studentId, newInterviewTime, duration) => {
  const conflicts = await Interview.find({
    student: studentId,
    status: { $in: [INTERVIEW_STATUS.WAITING, INTERVIEW_STATUS.IN_PROGRESS] },
    scheduledTime: {
      $gte: new Date(newInterviewTime.getTime() - duration * 60000),
      $lte: new Date(newInterviewTime.getTime() + duration * 60000)
    }
  }).populate('company');

  return conflicts;
};

export const resolveConflict = async (interview1, interview2) => {
  // Higher priority interview keeps the slot
  if (interview1.priority < interview2.priority) {
    return await rescheduleInterview(interview2);
  } else if (interview2.priority < interview1.priority) {
    return await rescheduleInterview(interview1);
  } else {
    // Same priority, reschedule the later one
    const laterInterview = interview1.createdAt > interview2.createdAt ? interview1 : interview2;
    return await rescheduleInterview(laterInterview);
  }
};

export const rescheduleInterview = async (interview) => {
  // Mark as rescheduled and add to end of queue
  const updatedInterview = await Interview.findByIdAndUpdate(
    interview._id,
    {
      isRescheduled: true,
      rescheduledReason: 'Automatic conflict resolution',
      scheduledTime: null,
      queuePosition: await getNextQueuePosition(interview.company)
    },
    { new: true }
  );

  return updatedInterview;
};

const getNextQueuePosition = async (companyId) => {
  const lastPosition = await Interview.findOne({
    company: companyId,
    status: INTERVIEW_STATUS.WAITING
  }).sort({ queuePosition: -1 });

  return (lastPosition?.queuePosition || 0) + 1;
};