import { createSlice } from '@reduxjs/toolkit';

const initialProjects = [
  {
    id: 'p-1',
    name: 'TeamSync Web App',
    description: 'Real-time collaborative task workspace for distributed dev teams.',
    membersCount: 8,
    tasksCount: 24,
    status: 'ACTIVE',
  },
  {
    id: 'p-2',
    name: 'Mobile Client v2',
    description: 'React Native companion app for seamless task tracking on iOS & Android.',
    membersCount: 5,
    tasksCount: 14,
    status: 'PLANNING',
  },
];

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: initialProjects,
  },
  reducers: {
    addProject(state, action) {
      state.projects.unshift(action.payload);
    },
  },
});

export const { addProject } = projectSlice.actions;
export default projectSlice.reducer;
