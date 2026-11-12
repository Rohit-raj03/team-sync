import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/store/authSlice.js';
import taskReducer from '../features/tasks/store/taskSlice.js';
import projectReducer from '../features/projects/store/projectSlice.js';
import adminReducer from '../features/admin/store/adminSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    projects: projectReducer,
    admin: adminReducer,
  },
});

export default store;
