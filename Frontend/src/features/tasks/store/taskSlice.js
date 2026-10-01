import { createSlice } from "@reduxjs/toolkit";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../shared/constants/taskStatus.js";

const initialTasks = [
  {
    id: "t-1",
    title: "Configure Tailwind CSS v4 Theme & Design Tokens",
    description:
      "Establish global color palettes, card elevations, border radii, and typography scales matching Figma.",
    status: TASK_STATUS.COMPLETED,
    priority: TASK_PRIORITY.HIGH,
    startDate: "2026-09-20",
    dueDate: "2026-09-28",
    estimatedTime: "12h",
    projectId: "p-1",
    projectName: "TeamSync Web App",
    assignedTo: "Rohit Raj, Priya Singh",
    assignees: [
      {
        id: "u-1",
        name: "Rohit Raj",
        username: "rohitraj",
        role: "Frontend Developer",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-3",
        name: "Priya Singh",
        username: "priyasingh",
        role: "UI/UX Designer",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
      },
    ],
    tags: ["Frontend", "UI/UX", "Design System"],
    subtasks: [
      {
        id: "st-1",
        title: "Extract Figma primary colors and hex codes",
        completed: true,
      },
      {
        id: "st-2",
        title: "Setup responsive breakpoints and fluid font sizes",
        completed: true,
      },
    ],
    attachments: [
      { id: "att-1", name: "design-tokens-v1.json", size: "42 KB" },
    ],
  },
  {
    id: "t-2",
    title: "Develop Real-Time Assignee Multi-Selector & Search",
    description:
      "Allow multi-selecting team members, instant search by username, dynamic roles, and inline user invite capability.",
    status: TASK_STATUS.IN_PROGRESS,
    priority: TASK_PRIORITY.URGENT,
    startDate: "2026-09-22",
    dueDate: "2026-09-30",
    estimatedTime: "16h",
    projectId: "p-1",
    projectName: "TeamSync Web App",
    assignedTo: "Aman Kumar, Rohit Raj",
    assignees: [
      {
        id: "u-2",
        name: "Aman Kumar",
        username: "amankumar",
        role: "Backend Developer",
        avatar:
          "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&h=120&fit=crop&crop=faces",
      },
      {
        id: "u-1",
        name: "Rohit Raj",
        username: "rohitraj",
        role: "Frontend Developer",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces",
      },
    ],
    tags: ["Frontend", "Backend", "API"],
    subtasks: [
      {
        id: "st-3",
        title: "Implement real-time search filtering on team array",
        completed: true,
      },
      {
        id: "st-4",
        title: "Create quick invite modal for non-existent users",
        completed: true,
      },
      {
        id: "st-5",
        title: "Write responsive tests across viewports",
        completed: false,
      },
    ],
    attachments: [
      { id: "att-2", name: "assignee-picker-mockup.fig", size: "2.8 MB" },
    ],
  },
  {
    id: "t-3",
    title: "Implement Role-Based Access Control and Invitations",
    description:
      "Secure project endpoints, validate email domains, and configure team member invite permissions.",
    status: TASK_STATUS.TODO,
    priority: TASK_PRIORITY.MEDIUM,
    startDate: "2026-09-25",
    dueDate: "2026-10-05",
    estimatedTime: "24h",
    projectId: "p-2",
    projectName: "Mobile Client v2",
    assignedTo: "Angelina Davis",
    assignees: [
      {
        id: "u-4",
        name: "Angelina Davis",
        username: "angelina",
        role: "Lead Product Designer",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces",
      },
    ],
    tags: ["Security", "DevOps"],
    subtasks: [
      {
        id: "st-6",
        title: "Define RBAC permission matrix for workspace roles",
        completed: false,
      },
      {
        id: "st-7",
        title: "Send invitation emails with secure magic links",
        completed: false,
      },
    ],
    attachments: [],
  },
];

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: initialTasks,
    filter: "ALL",
    search: "",
  },
  reducers: {
    addTask(state, action) {
      const newTask = {
        ...action.payload,
        id: action.payload.id || `t-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      state.tasks.unshift(newTask);
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

export const { addTask, updateTask, deleteTask, setTaskFilter, setTaskSearch } =
  taskSlice.actions;

export default taskSlice.reducer;
