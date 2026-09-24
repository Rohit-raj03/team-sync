import { createSlice } from '@reduxjs/toolkit';
import { TASK_STATUS, TASK_PRIORITY } from '../../../shared/constants/taskStatus.js';

const initialTasks = [
  {
    id: 't-1',
    title: 'Configure Tailwind CSS v4 Theme',
    description: 'Set up custom design tokens and fluid typography for TeamSync.',
    status: TASK_STATUS.COMPLETED,
    priority: TASK_PRIORITY.HIGH,
    dueDate: '2026-09-28',
    assignedTo: 'Alex Johnson',
    projectId: 'p-1',
  },
  {
    id: 't-2',
    title: 'Design Team Collaboration Dashboard',
    description: 'Create responsive Kanban board and timeline overview views.',
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.URGENT,
    dueDate: '2026-09-30',
    assignedTo: 'Sarah Chen',
    projectId: 'p-1',
  },
  {
    id: 't-3',
    title: 'Implement Role-Based Access Control',
    description: 'Secure project endpoints and team member invites with permissions.',
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    dueDate: '2026-10-05',
    assignedTo: 'Dev Team',
    projectId: 'p-2',
  },
];

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: initialTasks,
    filter: 'ALL',
    search: '',
  },
  reducers: {
    addTask(state, action) {
      state.tasks.unshift(action.payload);
    },
    updateTask(state, action) {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload };
      }
    },
    deleteTask(state, action) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    setTaskFilter(state, action) {
      state.filter = action.payload;
    },
    setTaskSearch(state, action) {
      state.search = action.payload;
    },
  },
});

export const { addTask, updateTask, deleteTask, setTaskFilter, setTaskSearch } = taskSlice.actions;
export default taskSlice.reducer;
