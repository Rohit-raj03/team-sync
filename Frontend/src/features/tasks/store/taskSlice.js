import { createSlice } from "@reduxjs/toolkit";
import {
  TASK_STATUS,
  TASK_PRIORITY,
} from "../../../shared/constants/taskStatus.js";

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: [],
    filter: "ALL",
    search: "",
    loading: false,
    error: null,
  },
  reducers: {
    setTasks(state, action) {
      state.tasks = Array.isArray(action.payload) ? action.payload : [];
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
        _id: t._id || t.id || `t-${Date.now()}`,
        status: t.status || TASK_STATUS.TODO,
        priority: t.priority || TASK_PRIORITY.MEDIUM,
        createdAt: t.createdAt || new Date().toISOString(),
      };
      const existsIndex = state.tasks.findIndex(
        (item) => item.id === newTask.id || item._id === newTask.id,
      );
      if (existsIndex === -1) {
        state.tasks.unshift(newTask);
      } else {
        state.tasks[existsIndex] = { ...state.tasks[existsIndex], ...newTask };
      }
    },
    updateTask(state, action) {
      const updated = action.payload;
      const targetId = updated.id || updated._id;
      const idx = state.tasks.findIndex(
        (t) => t.id === targetId || t._id === targetId,
      );
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...updated };
      }
    },
    deleteTask(state, action) {
      const targetId = action.payload;
      state.tasks = state.tasks.filter(
        (t) => t.id !== targetId && t._id !== targetId,
      );
    },
    setTaskFilter(state, action) {
      state.filter = action.payload;
    },
    setTaskSearch(state, action) {
      state.search = action.payload;
    },
    toggleSubtask(state, action) {
      const { taskId, subtaskId } = action.payload;
      const task = state.tasks.find((t) => t.id === taskId || t._id === taskId);
      if (task && Array.isArray(task.subtasks)) {
        const sub = task.subtasks.find((s) => (s.id || s._id) === subtaskId);
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
