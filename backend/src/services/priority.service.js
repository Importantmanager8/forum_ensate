import { PRIORITY_LEVELS, OPPORTUNITY_PRIORITIES, USER_STATUS, USER_ROLES } from '../config/constants.js';

export const calculatePriority = (user, opportunityType) => {
  let basePriority = 0;
  let opportunityPriority = OPPORTUNITY_PRIORITIES[opportunityType] || 3;

  // User role/status priority
  if (user.role === USER_ROLES.COMMITTEE) {
    basePriority = PRIORITY_LEVELS.COMMITTEE;
  } else if (user.status === USER_STATUS.ENSA) {
    basePriority = PRIORITY_LEVELS.ENSA_STUDENT;
  } else {
    basePriority = PRIORITY_LEVELS.EXTERNAL_STUDENT;
  }

  // Combine priorities (lower number = higher priority)
  // Formula: (basePriority * 10) + opportunityPriority
  return (basePriority * 10) + opportunityPriority;
};

export const sortByPriority = (interviews) => {
  return interviews.sort((a, b) => {
    // First sort by priority (lower number = higher priority)
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    
    // If same priority, sort by creation time (first come first served)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

export const generateQueueOrder = (interviews) => {
  // Group interviews by priority level
  const grouped = interviews.reduce((acc, interview) => {
    const priority = Math.floor(interview.priority / 10);
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(interview);
    return acc;
  }, {});

  // Apply alternating pattern: 3 committee, 2 ENSA, 1 external
  const result = [];
  const ratios = { 1: 3, 2: 2, 3: 1 }; // committee: 3, ensa: 2, external: 1
  
  let maxLength = Math.max(...Object.values(grouped).map(arr => arr.length));
  
  for (let cycle = 0; cycle < maxLength; cycle++) {
    for (let priority = 1; priority <= 3; priority++) {
      const group = grouped[priority] || [];
      const ratio = ratios[priority];
      
      for (let i = 0; i < ratio && group.length > 0; i++) {
        const interview = group.shift();
        if (interview) {
          result.push(interview);
        }
      }
    }
  }

  return result;
};