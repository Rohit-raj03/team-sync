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
import { showToast, extractErrorMessage } from "../../../shared/utils/toast.js";

// Global cache and request deduplication state
let inFlightTasksPromise = null;
let lastTasksFetchTimestamp = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache window

export function useTasks(options = {}) {
  const { autoFetch = true } = options;
  const dispatch = useDispatch();
  const { tasks, filter, search, loading, error } = useSelector(
    (state) => state.tasks
  );

  const fetchTasks = useCallback(async (force = false) => {
    const isCacheValid = tasks.length > 0 && Date.now() - lastTasksFetchTimestamp < CACHE_TTL_MS;
    if (!force && isCacheValid) {
      return tasks;
    }

    if (inFlightTasksPromise) {
      return inFlightTasksPromise;
    }

    inFlightTasksPromise = (async () => {
      try {
        if (tasks.length === 0) {
          dispatch(setLoading(true));
        }
        const res = await taskService.getTasks();
        const serverTasks = res?.tasks || res?.data;
        if (Array.isArray(serverTasks)) {
          dispatch(setTasks(serverTasks));
          lastTasksFetchTimestamp = Date.now();
        }
        return serverTasks;
      } catch (err) {
        console.warn("Could not fetch tasks from server:", err.message);
        dispatch(setError(err.message));
        throw err;
      } finally {
        dispatch(setLoading(false));
        inFlightTasksPromise = null;
      }
    })();

    return inFlightTasksPromise;
  }, [dispatch, tasks.length]);

  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [autoFetch, fetchTasks]);

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
    const taskPromise = (async () => {
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
    })();

    return showToast.promise(taskPromise, {
      loading: "Creating task...",
      success: "Task created.",
      error: (err) => extractErrorMessage(err, "Failed to create task"),
    });
  };

  const handleUpdateTask = async (taskData, options = {}) => {
    const taskId = taskData.id || taskData._id;

    // Silent updates (e.g. subtask toggle) don't trigger intrusive notifications
    if (options.silent) {
      try {
        if (!String(taskId).startsWith("t-")) {
          await taskService.updateTask(taskId, taskData);
        }
      } catch (err) {
        console.warn("Could not persist silent task update:", err.message);
      }
      dispatch(updateTaskAction(taskData));
      return taskData;
    }

    const updatePromise = (async () => {
      let updated = taskData;
      if (!String(taskId).startsWith("t-")) {
        const res = await taskService.updateTask(taskId, taskData);
        updated = res?.task || res?.data || taskData;
      }
      dispatch(updateTaskAction(updated));
      return updated;
    })();

    return showToast.promise(updatePromise, {
      loading: "Updating task...",
      success: "Task updated.",
      error: (err) => extractErrorMessage(err, "Failed to update task"),
    });
  };

  const handleDeleteTask = async (id, reason) => {
    const deletePromise = (async () => {
      if (!String(id).startsWith("t-")) {
        await taskService.deleteTask(id, reason);
      }
      dispatch(deleteTaskAction(id));
      return true;
    })();

    return showToast.promise(deletePromise, {
      loading: "Deleting task...",
      success: "Task deleted.",
      error: (err) => extractErrorMessage(err, "Failed to delete task"),
    });
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
