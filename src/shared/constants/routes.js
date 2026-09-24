export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASK_DETAILS: (id = ':id') => `/tasks/${id}`,
  PROJECTS: '/projects',
  PROJECT_DETAILS: (id = ':id') => `/projects/${id}`,
  TEAM: '/team',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};
