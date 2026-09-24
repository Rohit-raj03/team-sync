import { useSelector, useDispatch } from 'react-redux';
import { addProject } from '../store/projectSlice.js';

export function useProjects() {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.projects);

  return {
    projects,
    addProject: (p) => dispatch(addProject({ ...p, id: `p-${Date.now()}` })),
  };
}
