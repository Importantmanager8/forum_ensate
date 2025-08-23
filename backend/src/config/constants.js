export const USER_ROLES = {
  STUDENT: 'student',
  COMMITTEE: 'committee',
  ADMIN: 'admin'
};

export const USER_STATUS = {
  ENSA: 'ensa',
  EXTERNAL: 'external'
};

export const OPPORTUNITY_TYPES = {
  PFA: 'pfa',
  PFE: 'pfe',
  EMPLOYMENT: 'employment',
  OBSERVATION: 'observation'
};

export const INTERVIEW_STATUS = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const PRIORITY_LEVELS = {
  COMMITTEE: 1,
  ENSA_STUDENT: 2,
  EXTERNAL_STUDENT: 3
};

export const OPPORTUNITY_PRIORITIES = {
  [OPPORTUNITY_TYPES.PFA]: 1,
  [OPPORTUNITY_TYPES.PFE]: 1,
  [OPPORTUNITY_TYPES.EMPLOYMENT]: 2,
  [OPPORTUNITY_TYPES.OBSERVATION]: 3
};

export const QUEUE_RATIOS = {
  COMMITTEE: 3,
  ENSA: 2,
  EXTERNAL: 1
};