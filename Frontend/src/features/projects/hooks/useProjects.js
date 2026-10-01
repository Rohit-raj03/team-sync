import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addProject,
  updateProject,
  deleteProject,
  tagMemberToProject,
  untagMemberFromProject,
  setProjectFilter,
  setProjectSearch,
} from "../store/projectSlice.js";

/**
 * Feature Hook: useProjects
 * Layer: features/projects/hooks/
 * Responsibility: Provides projects state, member tagging operations, and computes real-time connected task metrics.
 */
export function useProjects() {
  const dispatch = useDispatch();
  const { projects, filter, search } = useSelector((state) => state.projects);
  const tasks = useSelector((state) => state.tasks?.tasks || []);

  // Compute linked tasks and completion percentage dynamically for every project
  const enrichedProjects = useMemo(() => {
    return projects.map((p) => {
      const projectTasks = tasks.filter((t) => t.projectId === p.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(
        (t) => t.status === "COMPLETED" || t.status === "Done",
      ).length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        ...p,
        tasksCount: totalTasks,
        completedTasksCount: completedTasks,
        progress,
        membersCount: p.members ? p.members.length : 0,
      };
    });
  }, [projects, tasks]);

  const filteredProjects = useMemo(() => {
    return enrichedProjects.filter((p) => {
      const matchesFilter = filter === "ALL" || p.status === filter;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.members?.some((m) =>
          m.name.toLowerCase().includes(search.toLowerCase()),
        );
      return matchesFilter && matchesSearch;
    });
  }, [enrichedProjects, filter, search]);

  const getProjectById = (id) => {
    return enrichedProjects.find((p) => p.id === id) || null;
  };

  const getProjectTasks = (id) => {
    return tasks.filter((t) => t.projectId === id);
  };

  return {
    projects: filteredProjects,
    allProjects: enrichedProjects,
    filter,
    search,
    setFilter: (f) => dispatch(setProjectFilter(f)),
    setSearch: (s) => dispatch(setProjectSearch(s)),
    getProjectById,
    getProjectTasks,
    addProject: (data) => dispatch(addProject(data)),
    updateProject: (data) => dispatch(updateProject(data)),
    deleteProject: (id) => dispatch(deleteProject(id)),
    tagMemberToProject: (projectId, member, projectRole) =>
      dispatch(tagMemberToProject({ projectId, member, projectRole })),
    untagMemberFromProject: (projectId, memberId) =>
      dispatch(untagMemberFromProject({ projectId, memberId })),
  };
}
