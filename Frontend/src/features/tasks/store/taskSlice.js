import { createSlice } from "@reduxjs/toolkit";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../shared/constants/taskStatus.js";

const DEFAULT_INDIVIDUAL_TASK = {
  id: "default-self-task-1",
  _id: "default-self-task-1",
  title: "Self Task (Individual / No Project)",
  description: "This is a default standalone task that does not belong to any project. You can assign and @mention any team members freely.",
  project: null,
  projectId: null,
  projectName: "Individual Task",
  isIndividual: true,
  status: TASK_STATUS.TODO,
  priority: TASK_PRIORITY.MEDIUM,
  startDate: new Date().toISOString().split("T")[0],
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  estimatedTime: "4h",
  assignees: [],
  assignedTo: "Unassigned",
  tags: ["Self", "Individual"],
  subtasks: [
    { id: "sub-1", title: "Review standalone task features", completed: false },
    { id: "sub-2", title: "Tag team members with @mention", completed: false },
  ],
  attachments: [],
  comment: "",
  mentions: [],
  createdAt: new Date().toISOString(),
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [DEFAULT_INDIVIDUAL_TASK],
    filter: "ALL",
    search: "",
    loading: false,
    error: null,
  },
  reducers: {
    setTasks(state, action) {
      const serverTasks = action.payload || [];
      const hasIndividual = serverTasks.some(
        (t) => t.isIndividual || (!t.project && !t.projectId) || t.projectName === "Individual Task"
      );
      if (!hasIndividual && serverTasks.length === 0) {
        state.tasks = [DEFAULT_INDIVIDUAL_TASK];
      } else {
        state.tasks = serverTasks;
      }
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    addTask(state, action) {
      const t = action.payload;
      const newTask = {
        ...t,
        id: t.id || t._id || `t-${Date.now()}`,
        _id: t._id || t.id,
        createdAt: t.createdAt || new Date().toISOString(),
      };
      const existsIndex = state.tasks.findIndex(
        (item) => item.id === newTask.id || item._id === newTask.id
      );
      if (existsIndex === -1) {
        state.tasks.unshift(newTask);
      } else {
        state.tasks[existsIndex] = newTask;
      }
    },
    updateTask(state, action) {
      const updated = action.payload;
      const targetId = updated.id || updated._id;
      const idx = state.tasks.findIndex(
        (t) => t.id === targetId || t._id === targetId
      );
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...updated };
      }
    },
    deleteTask(state, action) {
      const id = action.payload;
      state.tasks = state.tasks.filter((t) => t.id !== id && t._id !== id);
    },
    setTaskFilter(state, action) {
      state.filter = action.payload;
    },
    setTaskSearch(state, action) {
      state.search = action.payload;
    },
    toggleSubtask(state, action) {
      const { taskId, subtaskId } = action.payload;
      const task = state.tasks.find(
        (t) => t.id === taskId || t._id === taskId
      );
      if (task && Array.isArray(task.subtasks)) {
        const sub = task.subtasks.find(
          (s) => (s.id || s._id) === subtaskId
        );
        if (sub) {
          sub.completed = !sub.completed;
        }
      }
    },
  },
});

export const {
  setTasks,
  setLoading,
  setError,
  addTask,
  updateTask,
  deleteTask,
  setTaskFilter,
  setTaskSearch,
  toggleSubtask,
} = taskSlice.actions;

export default taskSlice.reducer;
