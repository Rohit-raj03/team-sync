import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case TASK_STATUS.COMPLETED:
      return 'success';
    case TASK_STATUS.IN_PROGRESS:
      return 'primary';
    case TASK_STATUS.IN_REVIEW:
      return 'warning';
    default:
      return 'default';
  }
};

export const getPriorityBadgeVariant = (priority) => {
  switch (priority) {
    case TASK_PRIORITY.URGENT:
      return 'danger';
    case TASK_PRIORITY.HIGH:
      return 'warning';
    case TASK_PRIORITY.MEDIUM:
      return 'primary';
    default:
      return 'default';
  }
};
