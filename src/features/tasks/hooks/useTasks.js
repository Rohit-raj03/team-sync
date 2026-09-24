import { useSelector, useDispatch } from 'react-redux';
import { addTask, updateTask, deleteTask, setTaskFilter, setTaskSearch } from '../store/taskSlice.js';

export function useTasks() {
  const dispatch = useDispatch();
  const { tasks, filter, search } = useSelector((state) => state.tasks);

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'ALL' || task.status === filter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    search,
    addTask: (task) => dispatch(addTask({ ...task, id: `t-${Date.now()}` })),
    updateTask: (task) => dispatch(updateTask(task)),
    deleteTask: (id) => dispatch(deleteTask(id)),
    setFilter: (f) => dispatch(setTaskFilter(f)),
    setSearch: (s) => dispatch(setTaskSearch(s)),
  };
}
