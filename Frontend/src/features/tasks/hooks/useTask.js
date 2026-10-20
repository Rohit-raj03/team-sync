import { useSelector } from 'react-redux';

export function useTask(id) {
  const task = useSelector((state) =>
    state.tasks.tasks.find((t) => t.id === id || t._id === id)
  );
  return { task };
}
