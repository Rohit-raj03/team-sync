import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTasks,
  setLoading,
  setError,
  addTask as addTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  setTaskFilter,
  setTaskSearch,
  toggleSubtask as toggleSubtaskAction,
} from "../store/taskSlice.js";
import { taskService } from "../services/task.service.js";

export function useTasks() {
  const dispatch = useDispatch();
  const { tasks, filter, search, loading, error } = useSelector(
    (state) => state.tasks
  );

  const fetchTasks = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await taskService.getTasks();
      const serverTasks = res?.tasks || res?.data;
      if (Array.isArray(serverTasks)) {
        dispatch(setTasks(serverTasks));
      }
    } catch (err) {
      console.warn("Could not fetch tasks from server:", err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter((task) => {
    const isIndividual =
      task.isIndividual ||
      !task.project && !task.projectId ||
      task.projectName === "Individual Task";

    const matchesFilter =
      filter === "ALL" ||
      (filter === "INDIVIDUAL" && isIndividual) ||
      task.status === filter ||
      task.status?.toUpperCase() === filter.toUpperCase();

    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      task.title?.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q) ||
      task.assignedTo?.toLowerCase().includes(q) ||
      task.projectName?.toLowerCase().includes(q) ||
      task.tags?.some((t) => t.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const handleAddTask = async (taskData) => {
    try {
      const res = await taskService.createTask(taskData);
      const created = res?.task || res?.data || taskData;
      dispatch(addTaskAction(created));
      return created;
    } catch (err) {
      const fallbackTask = {
        ...taskData,
        id: `t-${Date.now()}`,
      };
      dispatch(addTaskAction(fallbackTask));
      return fallbackTask;
    }
  };

  const handleUpdateTask = async (taskData) => {
    const taskId = taskData.id || taskData._id;
    try {
      const res = await taskService.updateTask(taskId, taskData);
      const updated = res?.task || res?.data || taskData;
      dispatch(updateTaskAction(updated));
      return updated;
    } catch (err) {
      dispatch(updateTaskAction(taskData));
      return taskData;
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      dispatch(deleteTaskAction(id));
      return true;
    } catch (err) {
      dispatch(deleteTaskAction(id));
      return false;
    }
  };

  const handleToggleSubtask = async (taskId, subtaskId) => {
    dispatch(toggleSubtaskAction({ taskId, subtaskId }));
    try {
      await taskService.toggleSubtask(taskId, subtaskId);
    } catch (err) {
      console.warn("Error persisting subtask toggle:", err.message);
    }
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    search,
    loading,
    error,
    fetchTasks,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleSubtask: handleToggleSubtask,
    setFilter: (f) => dispatch(setTaskFilter(f)),
    setSearch: (s) => dispatch(setTaskSearch(s)),
  };
}
